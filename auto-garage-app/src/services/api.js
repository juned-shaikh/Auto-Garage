const API_URL = 'https://auto-garage-backend.onrender.com/api';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

export const api = {
  // Parts API
  getParts: () => fetch(`${API_URL}/parts`).then(handleResponse),
  getPart: (id) => fetch(`${API_URL}/parts/${id}`).then(handleResponse),
  createPart: (data) => fetch(`${API_URL}/parts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updatePart: (id, data) => fetch(`${API_URL}/parts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deletePart: (id) => fetch(`${API_URL}/parts/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),
  getLowStockParts: () => fetch(`${API_URL}/parts/low-stock/all`).then(handleResponse),

  // Cars API
  getCars: () => fetch(`${API_URL}/cars`).then(handleResponse),
  getCar: (id) => fetch(`${API_URL}/cars/${id}`).then(handleResponse),
  createCar: (data) => fetch(`${API_URL}/cars`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateCar: (id, data) => fetch(`${API_URL}/cars/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteCar: (id) => fetch(`${API_URL}/cars/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),
  getCarStats: () => fetch(`${API_URL}/cars/stats/overview`).then(handleResponse),

  // Customers API
  getCustomers: () => fetch(`${API_URL}/customers`).then(handleResponse),
  getCustomer: (id) => fetch(`${API_URL}/customers/${id}`).then(handleResponse),
  createCustomer: (data) => fetch(`${API_URL}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateCustomer: (id, data) => fetch(`${API_URL}/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteCustomer: (id) => fetch(`${API_URL}/customers/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),

  // Invoices API
  getInvoices: () => fetch(`${API_URL}/invoices`).then(handleResponse),
  getInvoice: (id) => fetch(`${API_URL}/invoices/${id}`).then(handleResponse),
  createInvoice: (data) => fetch(`${API_URL}/invoices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateInvoice: (id, data) => fetch(`${API_URL}/invoices/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteInvoice: (id) => fetch(`${API_URL}/invoices/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),
  getInvoicesByCustomer: (customerId) => fetch(`${API_URL}/invoices/customer/${customerId}`).then(handleResponse),

  // Auth API
  login: (data) => fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  register: (data) => fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  getCurrentUser: () => fetch(`${API_URL}/auth/me`, {
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  }).then(handleResponse),
  resetPassword: (data) => fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  getDashboardStats: () => fetch(`${API_URL}/dashboard/stats`).then(handleResponse),
  getRecentTransactions: (limit = 5) => fetch(`${API_URL}/dashboard/transactions?limit=${limit}`).then(handleResponse),
  getMonthlySales: (year) => fetch(`${API_URL}/dashboard/monthly-sales${year ? `?year=${year}` : ''}`).then(handleResponse),
  getInventoryByCategory: () => fetch(`${API_URL}/dashboard/inventory-category`).then(handleResponse),
};
