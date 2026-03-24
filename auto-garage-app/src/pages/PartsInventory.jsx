import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, Package, AlertTriangle } from 'lucide-react'
import { api } from '../services/api'

const PartsInventory = () => {
  const [parts, setParts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPart, setEditingPart] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'Engine',
    quantity: '',
    minQuantity: '',
    buyPrice: '',
    sellPrice: '',
    supplier: '',
    location: ''
  })

  const categories = ['Engine', 'Brakes', 'Electrical', 'Body', 'Suspension', 'Transmission', 'Other']
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchParts()
  }, [])

  const fetchParts = async () => {
    try {
      setLoading(true)
      const data = await api.getParts()
      setParts(data)
    } catch (err) {
      console.error('Error fetching parts:', err)
      alert('Failed to load parts')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newPart = {
      name: formData.name,
      category: formData.category,
      quantity: parseInt(formData.quantity),
      minQuantity: parseInt(formData.minQuantity),
      buyPrice: parseFloat(formData.buyPrice),
      sellPrice: parseFloat(formData.sellPrice),
      supplier: formData.supplier,
      location: formData.location
    }

    try {
      if (editingPart) {
        await api.updatePart(editingPart._id, newPart)
      } else {
        await api.createPart(newPart)
      }
      fetchParts()
      closeModal()
    } catch (err) {
      alert('Error saving part: ' + err.message)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this part?')) {
      try {
        await api.deletePart(id)
        fetchParts()
      } catch (err) {
        alert('Error deleting part: ' + err.message)
      }
    }
  }

  const openModal = (part = null) => {
    if (part) {
      setEditingPart(part)
      setFormData({
        name: part.name,
        category: part.category,
        quantity: part.quantity.toString(),
        minQuantity: part.minQuantity.toString(),
        buyPrice: part.buyPrice.toString(),
        sellPrice: part.sellPrice.toString(),
        supplier: part.supplier,
        location: part.location
      })
    } else {
      setEditingPart(null)
      setFormData({
        name: '',
        category: 'Engine',
        quantity: '',
        minQuantity: '',
        buyPrice: '',
        sellPrice: '',
        supplier: '',
        location: ''
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingPart(null)
  }

  const filteredParts = parts.filter(part =>
    part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const lowStockCount = parts.filter(p => p.quantity < p.minQuantity).length

  return (
    <div>
      <div className="page-header">
        <h1>Parts Inventory</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} />
          Add Part
        </button>
      </div>

      {lowStockCount > 0 && (
        <div className="card" style={{ borderLeft: '4px solid #f57c00', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f57c00' }}>
            <AlertTriangle size={20} />
            <span><strong>{lowStockCount}</strong> parts are below minimum stock level</span>
          </div>
        </div>
      )}

      <div className="card">
        <div className="search-bar">
          <Search size={20} color="#666" />
          <input
            type="text"
            placeholder="Search parts by name, category, or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Part Name</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Buy Price</th>
              <th>Sell Price</th>
              <th>Supplier</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredParts.map(part => (
              <tr key={part._id} style={part.quantity < part.minQuantity ? { background: '#fff8e1' } : {}}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Package size={16} color="#666" />
                    {part.name}
                  </div>
                </td>
                <td>{part.category}</td>
                <td>
                  <span style={{ 
                    color: part.quantity < part.minQuantity ? '#f57c00' : '#388e3c',
                    fontWeight: 500
                  }}>
                    {part.quantity}
                  </span>
                  {part.quantity < part.minQuantity && (
                    <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: '#f57c00' }}>
                      (Low)
                    </span>
                  )}
                </td>
                <td>₹{part.buyPrice.toLocaleString()}</td>
                <td>₹{part.sellPrice.toLocaleString()}</td>
                <td>{part.supplier}</td>
                <td>{part.location}</td>
                <td>
                  <button className="action-btn edit" onClick={() => openModal(part)}>
                    <Edit2 size={16} />
                  </button>
                  <button className="action-btn delete" onClick={() => handleDelete(part._id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredParts.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                  No parts found. Add your first part to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingPart ? 'Edit Part' : 'Add New Part'}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Part Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  className="form-control"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: e.target.value})}
                    required
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Min Quantity Alert</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.minQuantity}
                    onChange={e => setFormData({...formData, minQuantity: e.target.value})}
                    required
                    min="0"
                  />
                </div>
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
              </div>
              <div className="form-group">
                <label>Supplier</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.supplier}
                  onChange={e => setFormData({...formData, supplier: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Storage Location</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g., Shelf A-12"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPart ? 'Update Part' : 'Add Part'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PartsInventory
