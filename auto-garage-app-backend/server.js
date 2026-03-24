const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/auto-garage')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Routes
app.use('/api/parts', require('./routes/parts'));
app.use('/api/cars', require('./routes/cars'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/auth', require('./routes/auth'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
