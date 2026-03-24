import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, FileText, Download, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { api } from '../services/api'

const Invoices = () => {
  const [invoices, setInvoices] = useState([])
  const [customers, setCustomers] = useState([])
  const [parts, setParts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewInvoice, setViewInvoice] = useState(null)
  const [editingInvoice, setEditingInvoice] = useState(null)
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    date: '',
    dueDate: '',
    items: [{ type: 'service', name: '', quantity: 1, price: 0 }],
    notes: '',
    status: 'pending'
  })

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [invoicesRes, customersRes, partsRes] = await Promise.all([
        api.getInvoices(),
        api.getCustomers(),
        api.getParts()
      ])
      setInvoices(invoicesRes)
      setCustomers(customersRes)
      setParts(partsRes)
    } catch (err) {
      console.error('Error fetching data:', err)
    }
  }

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newInvoice = {
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      date: formData.date,
      dueDate: formData.dueDate,
      items: formData.items.map(item => ({
        type: item.type,
        name: item.name,
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price)
      })),
      notes: formData.notes,
      status: formData.status,
      total: calculateTotal(formData.items)
    }

    try {
      if (editingInvoice) {
        await api.updateInvoice(editingInvoice._id, newInvoice)
      } else {
        await api.createInvoice(newInvoice)
      }
      fetchData()
      closeModal()
    } catch (err) {
      alert('Error saving invoice: ' + err.message)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await api.deleteInvoice(id)
        fetchData()
      } catch (err) {
        alert('Error deleting invoice: ' + err.message)
      }
    }
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { type: 'service', name: '', quantity: 1, price: 0 }]
    })
  }

  const addPartItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { type: 'part', partId: '', name: '', quantity: 1, price: 0 }]
    })
  }

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index)
    setFormData({ ...formData, items: newItems })
  }

  const updateItem = (index, field, value) => {
    const newItems = formData.items.map((item, i) => {
      if (i === index) {
        if (field === 'partId') {
          const part = parts.find(p => p._id === value)
          return { ...item, partId: value, name: part?.name || '', price: part?.sellPrice || 0 }
        }
        if (field === 'type') {
          return { ...item, type: value, partId: '', name: '', price: 0 }
        }
        return { ...item, [field]: field === 'quantity' ? parseInt(value) : field === 'price' ? parseFloat(value) : value }
      }
      return item
    })
    setFormData({ ...formData, items: newItems })
  }

  const openModal = (invoice = null) => {
    if (invoice) {
      setEditingInvoice(invoice)
      setFormData({
        customerName: invoice.customerName || '',
        customerPhone: invoice.customerPhone || '',
        date: invoice.date.split('T')[0],
        dueDate: invoice.dueDate.split('T')[0],
        items: invoice.items.map(item => ({
          type: item.type || 'service',
          name: item.name || '',
          partId: item.partId?._id || item.partId || '',
          quantity: item.quantity,
          price: item.price
        })),
        notes: invoice.notes,
        status: invoice.status
      })
    } else {
      setEditingInvoice(null)
      setFormData({
        customerName: '',
        customerPhone: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        items: [{ type: 'service', name: '', quantity: 1, price: 0 }],
        notes: '',
        status: 'pending'
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingInvoice(null)
  }

  const exportToPDF = async (invoice) => {
    const element = document.getElementById(`invoice-${invoice.id}`)
    if (!element) return

    const canvas = await html2canvas(element, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 210
    const pageHeight = 295
    const imgHeight = canvas.height * imgWidth / canvas.width
    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(`Invoice-${invoice.invoiceNumber}.pdf`)
  }

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const InvoiceTemplate = ({ invoice }) => {
    return (
      <div id={`invoice-${invoice._id}`} className="invoice-preview">
        <div className="invoice-header">
          <div>
            <h1 style={{ color: '#1976d2', marginBottom: '10px' }}>INVOICE</h1>
            <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{invoice.invoiceNumber}</p>
          </div>
          <div className="invoice-company">
            <h2>Auto Garage</h2>
            <p>123 Garage Street</p>
            <p>City, State 12345</p>
            <p>Phone: (123) 456-7890</p>
          </div>
        </div>

        <div className="invoice-details">
          <div>
            <h4 style={{ color: '#666', marginBottom: '10px' }}>Bill To:</h4>
            <p style={{ fontWeight: 600 }}>{invoice.customerName}</p>
            {invoice.customerPhone && <p>Phone: {invoice.customerPhone}</p>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <p><strong>Invoice Date:</strong> {new Date(invoice.date).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p>
            <p style={{ marginTop: '10px' }}>
              <span className={`badge badge-${invoice.status === 'paid' ? 'success' : invoice.status === 'overdue' ? 'danger' : 'warning'}`}>
                {invoice.status.toUpperCase()}
              </span>
            </p>
          </div>
        </div>

        <table className="invoice-table">
          <thead>
            <tr>
              <th>Item</th>
              <th style={{ textAlign: 'center' }}>Quantity</th>
              <th style={{ textAlign: 'right' }}>Unit Price</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right' }}>₹{item.price.toLocaleString()}</td>
                <td style={{ textAlign: 'right' }}>₹{(item.price * item.quantity).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-total">
          <p><strong>Subtotal:</strong> ₹{invoice.total.toLocaleString()}</p>
          <p><strong>Tax (0%):</strong> ₹0.00</p>
          <h3>Total: ₹{invoice.total.toLocaleString()}</h3>
        </div>

        {invoice.notes && (
          <div style={{ marginTop: '30px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
            <strong>Notes:</strong>
            <p style={{ marginTop: '5px' }}>{invoice.notes}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1>Invoices</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} />
          Create Invoice
        </button>
      </div>

      <div className="card">
        <div className="search-bar">
          <Search size={20} color="#666" />
          <input
            type="text"
            placeholder="Search invoices by number or customer..."
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
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Due Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(invoice => (
              <tr key={invoice._id}>
                <td>{invoice.invoiceNumber}</td>
                <td>{invoice.customerName}</td>
                <td>{new Date(invoice.date).toLocaleDateString()}</td>
                <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                <td>₹{invoice.total.toLocaleString()}</td>
                <td>
                  <span className={`badge badge-${invoice.status === 'paid' ? 'success' : invoice.status === 'overdue' ? 'danger' : 'warning'}`}>
                    {invoice.status}
                  </span>
                </td>
                <td>
                  <button className="action-btn view" onClick={() => setViewInvoice(invoice)}>
                    <Eye size={16} />
                  </button>
                  <button className="action-btn edit" onClick={() => openModal(invoice)}>
                    <Edit2 size={16} />
                  </button>
                  <button className="action-btn edit" onClick={() => exportToPDF(invoice)}>
                    <Download size={16} />
                  </button>
                  <button className="action-btn delete" onClick={() => handleDelete(invoice._id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                  No invoices found. Create your first invoice.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {filteredInvoices.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ color: '#666' }}>
              Page {currentPage} of {Math.ceil(filteredInvoices.length / itemsPerPage) || 1}
            </span>
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredInvoices.length / itemsPerPage) || 1, p + 1))}
              disabled={currentPage >= Math.ceil(filteredInvoices.length / itemsPerPage)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h2 className="modal-title">{editingInvoice ? 'Edit Invoice' : 'Create Invoice'}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Customer Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter customer name"
                    value={formData.customerName}
                    onChange={e => setFormData({...formData, customerName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Customer Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="Enter phone number"
                    value={formData.customerPhone}
                    onChange={e => setFormData({...formData, customerPhone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Invoice Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '15px' }}>
                <label>Due Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.dueDate}
                  onChange={e => setFormData({...formData, dueDate: e.target.value})}
                  required
                />
              </div>

              <div style={{ marginTop: '20px', marginBottom: '10px' }}>
                <h4>Invoice Items</h4>
              </div>
              
              {formData.items.map((item, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr auto', gap: '10px', marginBottom: '10px', alignItems: 'end' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <select
                      className="form-control"
                      value={item.type}
                      onChange={e => updateItem(index, 'type', e.target.value)}
                    >
                      <option value="service">Service</option>
                      <option value="part">Part</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    {item.type === 'part' ? (
                      <select
                        className="form-control"
                        value={item.partId}
                        onChange={e => updateItem(index, 'partId', e.target.value)}
                        required
                      >
                        <option value="">Select Part</option>
                        {parts.map(p => (
                          <option key={p._id} value={p._id}>{p.name} - ₹{p.sellPrice}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Car Coloring, Denting, Tyre Change"
                        value={item.name}
                        onChange={e => updateItem(index, 'name', e.target.value)}
                        required
                      />
                    )}
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={e => updateItem(index, 'quantity', e.target.value)}
                      required
                      min="1"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      placeholder="Price"
                      value={item.price}
                      onChange={e => updateItem(index, 'price', e.target.value)}
                      required
                      min="0"
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => removeItem(index)}
                    disabled={formData.items.length === 1}
                    style={{ padding: '8px' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={addItem}>
                  <Plus size={16} />
                  Add Service
                </button>
                <button type="button" className="btn btn-secondary" onClick={addPartItem}>
                  <Plus size={16} />
                  Add Part
                </button>
              </div>

              <div className="form-group" style={{ marginTop: '20px' }}>
                <label>Status</label>
                <select
                  className="form-control"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
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

              <div style={{ 
                background: '#f8f9fa', 
                padding: '15px', 
                borderRadius: '8px', 
                marginTop: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3>Total: ₹{calculateTotal(formData.items).toLocaleString()}</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingInvoice ? 'Update Invoice' : 'Create Invoice'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {viewInvoice && (
        <div className="modal-overlay" onClick={() => setViewInvoice(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h2 className="modal-title">Invoice {viewInvoice.invoiceNumber}</h2>
              <button className="modal-close" onClick={() => setViewInvoice(null)}>×</button>
            </div>
            <InvoiceTemplate invoice={viewInvoice} />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setViewInvoice(null)}>
                Close
              </button>
              <button className="btn btn-primary" onClick={() => exportToPDF(viewInvoice)}>
                <Download size={16} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Invoices
