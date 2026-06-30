const API_URL = 'https://auto-garage-backend.onrender.com/api';

// Returns auth headers if a token is stored
const authHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const handleResponse = async (response) => {
  if (response.status === 401) {
    // Token expired or invalid — clear session and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

// Shorthand helpers
const get = (path) =>
  fetch(`${API_URL}${path}`, {
    headers: { ...authHeaders() },
  }).then(handleResponse);

const post = (path, data) =>
  fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  }).then(handleResponse);

const put = (path, data) =>
  fetch(`${API_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  }).then(handleResponse);

const del = (path) =>
  fetch(`${API_URL}${path}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  }).then(handleResponse);

export const api = {
  // Parts API
  getParts:        ()           => get('/parts'),
  getPart:         (id)         => get(`/parts/${id}`),
  createPart:      (data)       => post('/parts', data),
  updatePart:      (id, data)   => put(`/parts/${id}`, data),
  deletePart:      (id)         => del(`/parts/${id}`),
  getLowStockParts: ()          => get('/parts/low-stock/all'),

  // Cars API
  getCars:         ()           => get('/cars'),
  getCar:          (id)         => get(`/cars/${id}`),
  createCar:       (data)       => post('/cars', data),
  updateCar:       (id, data)   => put(`/cars/${id}`, data),
  deleteCar:       (id)         => del(`/cars/${id}`),
  getCarStats:     ()           => get('/cars/stats/overview'),

  // Customers API
  getCustomers:    ()           => get('/customers'),
  getCustomer:     (id)         => get(`/customers/${id}`),
  createCustomer:  (data)       => post('/customers', data),
  updateCustomer:  (id, data)   => put(`/customers/${id}`, data),
  deleteCustomer:  (id)         => del(`/customers/${id}`),

  // Invoices API
  getInvoices:            ()              => get('/invoices'),
  getInvoice:             (id)            => get(`/invoices/${id}`),
  createInvoice:          (data)          => post('/invoices', data),
  updateInvoice:          (id, data)      => put(`/invoices/${id}`, data),
  deleteInvoice:          (id)            => del(`/invoices/${id}`),
  getInvoicesByCustomer:  (customerId)    => get(`/invoices/customer/${customerId}`),

  // Auth API (no token needed — public routes)
  login:    (data) => post('/auth/login', data),
  register: (data) => post('/auth/register', data),
  getCurrentUser: () => get('/auth/me'),

  // Change password (must be logged in — sends token automatically)
  resetPassword: (data) => post('/auth/reset-password', data),

  // Dashboard API
  getDashboardStats:      ()              => get('/dashboard/stats'),
  getRecentTransactions:  (limit = 5)     => get(`/dashboard/transactions?limit=${limit}`),
  getMonthlySales:        (year)          => get(`/dashboard/monthly-sales${year ? `?year=${year}` : ''}`),
  getInventoryByCategory: ()              => get('/dashboard/inventory-category'),
};
