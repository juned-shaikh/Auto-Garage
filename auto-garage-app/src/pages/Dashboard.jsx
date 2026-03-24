import React, { useState, useEffect } from 'react'
import { 
  DollarSign, 
  Package, 
  Users, 
  Car,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { api } from '../services/api'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProfit: 0,
    totalParts: 0,
    totalCustomers: 0,
    lowStockItems: 0
  })

  const [recentTransactions, setRecentTransactions] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [inventoryData, setInventoryData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch all dashboard data in parallel
        const [statsRes, transactionsRes, monthlyRes, inventoryRes] = await Promise.all([
          api.getDashboardStats(),
          api.getRecentTransactions(5),
          api.getMonthlySales(),
          api.getInventoryByCategory()
        ])

        setStats(statsRes)
        setRecentTransactions(transactionsRes)
        setMonthlyData(monthlyRes)
        setInventoryData(inventoryRes.length > 0 ? inventoryRes : [
          { name: 'Engine', value: 30 },
          { name: 'Brakes', value: 25 },
          { name: 'Electrical', value: 20 },
          { name: 'Body', value: 15 },
          { name: 'Other', value: 10 }
        ])
        setError(null)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load dashboard data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const COLORS = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2']

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      {loading && <div className="card" style={{ textAlign: 'center', padding: '40px' }}>Loading dashboard data...</div>}
      
      {error && (
        <div className="card" style={{ borderLeft: '4px solid #d32f2f', background: '#ffebee' }}>
          <div style={{ color: '#d32f2f' }}>{error}</div>
        </div>
      )}

      {!loading && !error && (
        <>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Sales</h3>
            <p>₹{stats.totalSales.toLocaleString()}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Profit</h3>
            <p>₹{stats.totalProfit.toLocaleString()}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <Package size={24} />
          </div>
          <div className="stat-info">
            <h3>Parts in Stock</h3>
            <p>{stats.totalParts}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Customers</h3>
            <p>{stats.totalCustomers}</p>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockItems > 0 && (
        <div className="card" style={{ borderLeft: '4px solid #f57c00' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f57c00' }}>
            <TrendingDown size={20} />
            <span><strong>{stats.lowStockItems}</strong> parts are running low on stock. <a href="/parts" style={{ color: '#f57c00', textDecoration: 'underline' }}>View Inventory</a></span>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="stats-grid">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Monthly Sales & Profit</h2>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Bar dataKey="sales" fill="#1976d2" name="Sales" />
                <Bar dataKey="profit" fill="#388e3c" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Inventory by Category</h2>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {inventoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Transactions</h2>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map((transaction, index) => (
              <tr key={index}>
                <td>{new Date(transaction.date).toLocaleDateString()}</td>
                <td>
                  {transaction.type === 'buy' && <span className="badge badge-warning">Buy</span>}
                  {transaction.type === 'sell' && <span className="badge badge-success">Sell</span>}
                  {transaction.type === 'invoice' && <span className="badge badge-info">Invoice</span>}
                </td>
                <td>
                  {transaction.make && transaction.model 
                    ? `${transaction.make} ${transaction.model}` 
                    : transaction.customerName || 'N/A'}
                </td>
                <td>
                  ₹{transaction.type === 'buy' 
                    ? transaction.buyPrice?.toLocaleString() 
                    : transaction.sellPrice?.toLocaleString() || transaction.total?.toLocaleString()}
                </td>
                <td>
                  <span className="badge badge-success">Completed</span>
                </td>
              </tr>
            ))}
            {recentTransactions.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                  No recent transactions
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </>
      )}
    </div>
  )
}

export default Dashboard
