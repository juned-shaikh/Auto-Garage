import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, User, Phone, Mail, MapPin, Car, FileText, Wrench, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { api } from '../services/api'

const Customers = () => {
  const [customers, setCustomers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [serviceFormData, setServiceFormData] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: ''
  })

  const [serviceItems, setServiceItems] = useState([{ name: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' }])

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const data = await api.getCustomers()
      setCustomers(data)
    } catch (err) {
      console.error('Error fetching customers:', err)
      alert('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Filter out empty service items
    const validServices = serviceItems.filter(item => item.name && item.amount)
      .map(item => ({
        name: item.name,
        amount: parseFloat(item.amount),
        date: item.date,
        notes: item.notes
      }))

    const newCustomer = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      services: validServices
    }

    try {
      if (editingCustomer) {
        await api.updateCustomer(editingCustomer._id, newCustomer)
      } else {
        await api.createCustomer(newCustomer)
      }
      fetchCustomers()
      closeModal()
    } catch (err) {
      alert('Error saving customer: ' + err.message)
    }
  }

  const addServiceItem = () => {
    setServiceItems([...serviceItems, { name: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' }])
  }

  const removeServiceItem = (index) => {
    setServiceItems(serviceItems.filter((_, i) => i !== index))
  }

  const updateServiceItem = (index, field, value) => {
    const newItems = serviceItems.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value }
      }
      return item
    })
    setServiceItems(newItems)
  }

  const handleAddService = async (e) => {
    e.preventDefault()
    if (!selectedCustomer) return

    const newService = {
      name: serviceFormData.name,
      amount: parseFloat(serviceFormData.amount),
      date: serviceFormData.date,
      notes: serviceFormData.notes
    }

    try {
      const updatedServices = [...(selectedCustomer.services || []), newService]
      await api.updateCustomer(selectedCustomer._id, {
        ...selectedCustomer,
        services: updatedServices
      })
      fetchCustomers()
      closeServiceModal()
      // Refresh selected customer
      const updated = await api.getCustomer(selectedCustomer._id)
      setSelectedCustomer(updated)
    } catch (err) {
      alert('Error adding service: ' + err.message)
    }
  }

  const handleDeleteService = async (serviceId) => {
    if (!selectedCustomer || !window.confirm('Delete this service?')) return

    try {
      const updatedServices = selectedCustomer.services.filter(s => s._id !== serviceId)
      await api.updateCustomer(selectedCustomer._id, {
        ...selectedCustomer,
        services: updatedServices
      })
      fetchCustomers()
      const updated = await api.getCustomer(selectedCustomer._id)
      setSelectedCustomer(updated)
    } catch (err) {
      alert('Error deleting service: ' + err.message)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.deleteCustomer(id)
        fetchCustomers()
      } catch (err) {
        alert('Error deleting customer: ' + err.message)
      }
    }
  }

  const openModal = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer)
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city
      })
      // Load existing services
      setServiceItems(customer.services?.length > 0 
        ? customer.services.map(s => ({ ...s, amount: s.amount.toString() }))
        : [{ name: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' }]
      )
    } else {
      setEditingCustomer(null)
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: ''
      })
      setServiceItems([{ name: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' }])
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCustomer(null)
  }

  const openServiceModal = (customer) => {
    setSelectedCustomer(customer)
    setServiceFormData({
      name: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    })
    setIsServiceModalOpen(true)
  }

  const closeServiceModal = () => {
    setIsServiceModalOpen(false)
    setServiceFormData({
      name: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    })
  }

  const viewCustomerDetails = (customer) => {
    setSelectedCustomer(customer)
  }

  const getCustomerStats = (customerId) => {
    const cars = JSON.parse(localStorage.getItem('cars') || '[]')
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]')
    
    const customerCars = cars.filter(c => 
      c.customer && c.customer.toLowerCase().includes(customers.find(c => c.id === customerId)?.name.toLowerCase())
    )
    const customerInvoices = invoices.filter(inv => inv.customerId === customerId)
    
    return {
      carsBought: customerCars.filter(c => c.type === 'buy').length,
      carsSold: customerCars.filter(c => c.type === 'sell').length,
      totalSpent: customerInvoices.reduce((sum, inv) => sum + inv.total, 0),
      invoices: customerInvoices.length
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  )

  // Pagination logic
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div>
      <div className="page-header">
        <h1>Customer Management</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      <div className="card">
        <div className="search-bar">
          <Search size={20} color="#666" />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>City</th>
              <th>Services</th>
              <th>Cars</th>
              <th>Invoices</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCustomers.map(customer => {
              const stats = getCustomerStats(customer._id)
              const serviceCount = customer.services?.length || 0
              const totalServicesAmount = customer.services?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0
              return (
                <tr key={customer._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={16} color="#666" />
                      {customer.name}
                    </div>
                  </td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.city}</td>
                  <td>
                    {serviceCount > 0 ? (
                      <span style={{ color: '#1976d2', fontWeight: 500 }}>
                        {serviceCount} (₹{totalServicesAmount.toLocaleString()})
                      </span>
                    ) : (
                      <span style={{ color: '#999' }}>-</span>
                    )}
                  </td>
                  <td>{stats.carsSold}</td>
                  <td>{stats.invoices}</td>
                  <td>
                    {/* <button className="action-btn view" onClick={() => viewCustomerDetails(customer)} title="View Details">
                      <Car size={16} />
                    </button> */}
                    <button className="action-btn edit" onClick={() => openModal(customer)} title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button className="action-btn" style={{ background: '#e8f5e9', color: '#2e7d32' }} onClick={() => openServiceModal(customer)} title="Add Service">
                      <Wrench size={16} />
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(customer._id)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              )
            })}
            {paginatedCustomers.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                  No customers found. Add your first customer.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {filteredCustomers.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ color: '#666' }}>
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage(p => Math.min(totalPages || 1, p + 1))}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Customer Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h2 className="modal-title">{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  required
                />
              </div>

              {/* Services Section */}
              <div style={{ marginTop: '20px', marginBottom: '10px' }}>
                <h4 style={{ color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wrench size={18} />
                  Services (Optional)
                </h4>
              </div>
              
              {serviceItems.map((item, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '10px', marginBottom: '10px', alignItems: 'end' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Service name (e.g. Car Coloring)"
                      value={item.name}
                      onChange={e => updateServiceItem(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      placeholder="Amount"
                      value={item.amount}
                      onChange={e => updateServiceItem(index, 'amount', e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input
                      type="date"
                      className="form-control"
                      value={item.date}
                      onChange={e => updateServiceItem(index, 'date', e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Notes"
                      value={item.notes}
                      onChange={e => updateServiceItem(index, 'notes', e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => removeServiceItem(index)}
                    disabled={serviceItems.length === 1 && !item.name && !item.amount}
                    style={{ padding: '8px' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}

              <button type="button" className="btn btn-secondary" onClick={addServiceItem} style={{ marginTop: '10px' }}>
                <Plus size={16} />
                Add Another Service
              </button>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCustomer ? 'Update Customer' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      {isServiceModalOpen && selectedCustomer && (
        <div className="modal-overlay" onClick={closeServiceModal}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Add Service for {selectedCustomer.name}</h2>
              <button className="modal-close" onClick={closeServiceModal}>×</button>
            </div>
            <form onSubmit={handleAddService}>
              <div className="form-group">
                <label>Service Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Car Coloring, Denting, Tyre Change"
                  value={serviceFormData.name}
                  onChange={e => setServiceFormData({...serviceFormData, name: e.target.value})}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    placeholder="0.00"
                    value={serviceFormData.amount}
                    onChange={e => setServiceFormData({...serviceFormData, amount: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={serviceFormData.date}
                    onChange={e => setServiceFormData({...serviceFormData, date: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Optional notes about the service"
                  value={serviceFormData.notes}
                  onChange={e => setServiceFormData({...serviceFormData, notes: e.target.value})}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={closeServiceModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Customer Details</h2>
              <button className="modal-close" onClick={() => setSelectedCustomer(null)}>×</button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  background: '#e3f2fd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User size={28} color="#1976d2" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem' }}>{selectedCustomer.name}</h3>
                  <p style={{ color: '#666' }}>Customer ID: {selectedCustomer.id}</p>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ marginBottom: '10px', color: '#333' }}>Contact Information</h4>
                <p><strong>Phone:</strong> {selectedCustomer.phone}</p>
                <p><strong>Email:</strong> {selectedCustomer.email}</p>
                <p><strong>Address:</strong> {selectedCustomer.address}, {selectedCustomer.city}</p>
              </div>

              {/* Services Section */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ marginBottom: '10px', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wrench size={18} />
                  Services History
                </h4>
                {selectedCustomer.services && selectedCustomer.services.length > 0 ? (
                  <div>
                    <table className="data-table" style={{ fontSize: '0.875rem' }}>
                      <thead>
                        <tr>
                          <th>Service</th>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Notes</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCustomer.services.map((service, index) => (
                          <tr key={service._id || index}>
                            <td>{service.name}</td>
                            <td>{new Date(service.date).toLocaleDateString()}</td>
                            <td>₹{service.amount?.toLocaleString()}</td>
                            <td>{service.notes || '-'}</td>
                            <td>
                              <button 
                                className="action-btn delete" 
                                onClick={() => handleDeleteService(service._id)}
                                title="Delete Service"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ marginTop: '10px', padding: '10px', background: '#e8f5e9', borderRadius: '8px', textAlign: 'right' }}>
                      <strong>Total Services: ₹{selectedCustomer.services.reduce((sum, s) => sum + (s.amount || 0), 0).toLocaleString()}</strong>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: '#666', fontStyle: 'italic' }}>No services added yet.</p>
                )}
                <button 
                  className="btn btn-secondary" 
                  onClick={() => openServiceModal(selectedCustomer)}
                  style={{ marginTop: '10px' }}
                >
                  <Plus size={16} />
                  Add New Service
                </button>
              </div>

              {(() => {
                const stats = getCustomerStats(selectedCustomer._id)
                return (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ marginBottom: '10px', color: '#333' }}>Activity Summary</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                      <div className="card" style={{ textAlign: 'center' }}>
                        <Car size={20} style={{ marginBottom: '5px' }} />
                        <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{stats.carsSold}</p>
                        <p style={{ fontSize: '0.75rem', color: '#666' }}>Cars</p>
                      </div>
                      <div className="card" style={{ textAlign: 'center' }}>
                        <FileText size={20} style={{ marginBottom: '5px' }} />
                        <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{stats.invoices}</p>
                        <p style={{ fontSize: '0.75rem', color: '#666' }}>Invoices</p>
                      </div>
                      <div className="card" style={{ textAlign: 'center' }}>
                        <Wrench size={20} style={{ marginBottom: '5px' }} />
                        <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{selectedCustomer.services?.length || 0}</p>
                        <p style={{ fontSize: '0.75rem', color: '#666' }}>Services</p>
                      </div>
                    </div>
                    <div style={{ marginTop: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                      <p><strong>Invoice Total:</strong> ₹{stats.totalSpent.toLocaleString()}</p>
                      <p><strong>Services Total:</strong> ₹{(selectedCustomer.services?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0).toLocaleString()}</p>
                    </div>
                  </div>
                )
              })()}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setSelectedCustomer(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Customers
