import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, Car, TrendingUp, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '../services/api'

const CarHistory = () => {
  const [cars, setCars] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCar, setEditingCar] = useState(null)
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    vin: '',
    type: 'buy',
    buyPrice: '',
    sellPrice: '',
    date: '',
    customer: '',
    notes: ''
  })

  const [loading, setLoading] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchCars()
  }, [])

  const fetchCars = async () => {
    try {
      setLoading(true)
      const data = await api.getCars()
      setCars(data)
    } catch (err) {
      console.error('Error fetching cars:', err)
      alert('Failed to load car records')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newCar = {
      make: formData.make,
      model: formData.model,
      year: parseInt(formData.year),
      vin: formData.vin,
      type: formData.type,
      buyPrice: parseFloat(formData.buyPrice),
      sellPrice: formData.sellPrice ? parseFloat(formData.sellPrice) : 0,
      date: formData.date,
      customer: formData.customer,
      notes: formData.notes
    }

    try {
      if (editingCar) {
        await api.updateCar(editingCar._id, newCar)
      } else {
        await api.createCar(newCar)
      }
      fetchCars()
      closeModal()
    } catch (err) {
      alert('Error saving car record: ' + err.message)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await api.deleteCar(id)
        fetchCars()
      } catch (err) {
        alert('Error deleting car record: ' + err.message)
      }
    }
  }

  const openModal = (car = null) => {
    if (car) {
      setEditingCar(car)
      setFormData({
        make: car.make,
        model: car.model,
        year: car.year.toString(),
        vin: car.vin,
        type: car.type,
        buyPrice: car.buyPrice.toString(),
        sellPrice: car.sellPrice ? car.sellPrice.toString() : '',
        date: car.date,
        customer: car.customer,
        notes: car.notes
      })
    } else {
      setEditingCar(null)
      setFormData({
        make: '',
        model: '',
        year: '',
        vin: '',
        type: 'buy',
        buyPrice: '',
        sellPrice: '',
        date: new Date().toISOString().split('T')[0],
        customer: '',
        notes: ''
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCar(null)
  }

  const filteredCars = cars.filter(car => {
    const matchesSearch = car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         car.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         car.customer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || car.type === filter
    return matchesSearch && matchesFilter
  })

  const totalProfit = cars.reduce((sum, car) => sum + (car.profit || 0), 0)
  const totalSold = cars.filter(c => c.type === 'sell').length
  const totalBought = cars.filter(c => c.type === 'buy').length

  return (
    <div>
      <div className="page-header">
        <h1>Car Buy/Sell History</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} />
          Add Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Car size={24} />
          </div>
          <div className="stat-info">
            <h3>Cars Bought</h3>
            <p>{totalBought}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h3>Cars Sold</h3>
            <p>{totalSold}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Profit</h3>
            <p>₹{totalProfit.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="search-bar">
          <Search size={20} color="#666" />
          <input
            type="text"
            placeholder="Search by make, model, VIN, or customer..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
          />
          <select
            className="form-control"
            style={{ width: 'auto' }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Transactions</option>
            <option value="buy">Buy Only</option>
            <option value="sell">Sell Only</option>
          </select>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Vehicle</th>
              <th>VIN</th>
              <th>Buy Price</th>
              <th>Sell Price</th>
              <th>Profit</th>
              <th>Customer</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCars.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(car => (
              <tr key={car._id}>
                <td>{new Date(car.date).toLocaleDateString()}</td>
                <td>
                  {car.type === 'buy' ? (
                    <span className="badge badge-warning">Buy</span>
                  ) : (
                    <span className="badge badge-success">Sell</span>
                  )}
                </td>
                <td>{car.year} {car.make} {car.model}</td>
                <td>{car.vin}</td>
                <td>₹{car.buyPrice.toLocaleString()}</td>
                <td>{car.sellPrice ? `₹${car.sellPrice.toLocaleString()}` : '-'}</td>
                <td style={{ color: car.profit > 0 ? '#388e3c' : car.profit < 0 ? '#d32f2f' : '#666' }}>
                  {car.profit ? `₹${car.profit.toLocaleString()}` : '-'}
                </td>
                <td>{car.customer || '-'}</td>
                <td>
                  <button className="action-btn edit" onClick={() => openModal(car)}>
                    <Edit2 size={16} />
                  </button>
                  <button className="action-btn delete" onClick={() => handleDelete(car._id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredCars.length === 0 && (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                  No transactions found. Add your first car transaction.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {filteredCars.length > itemsPerPage && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ color: '#666' }}>
              Page {currentPage} of {Math.ceil(filteredCars.length / itemsPerPage)}
            </span>
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredCars.length / itemsPerPage), p + 1))}
              disabled={currentPage === Math.ceil(filteredCars.length / itemsPerPage)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingCar ? 'Edit Transaction' : 'Add Transaction'}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Make</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.make}
                    onChange={e => setFormData({...formData, make: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Model</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.model}
                    onChange={e => setFormData({...formData, model: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Year</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.year}
                    onChange={e => setFormData({...formData, year: e.target.value})}
                    required
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>VIN</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.vin}
                  onChange={e => setFormData({...formData, vin: e.target.value})}
                  required
                  maxLength="17"
                />
              </div>
              <div className="form-group">
                <label>Transaction Type</label>
                <select
                  className="form-control"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  required
                >
                  <option value="buy">Buy (Purchase)</option>
                  <option value="sell">Sell (Sale)</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Buy Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={formData.buyPrice}
                    onChange={e => setFormData({...formData, buyPrice: e.target.value})}
                    required
                    min="0"
                  />
                </div>
                {formData.type === 'sell' && (
                  <div className="form-group">
                    <label>Sell Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={formData.sellPrice}
                      onChange={e => setFormData({...formData, sellPrice: e.target.value})}
                      required
                      min="0"
                    />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>{formData.type === 'buy' ? 'Seller' : 'Buyer'} Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.customer}
                  onChange={e => setFormData({...formData, customer: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  className="form-control"
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  rows="3"
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCar ? 'Update Transaction' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CarHistory
