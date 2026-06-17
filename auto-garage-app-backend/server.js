const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const dns = require('dns');

dotenv.config();

// Windows often blocks Node's default DNS SRV lookups for mongodb+srv:// URIs
if (process.platform === 'win32') {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
}

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const mongoUri =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  (isProduction ? null : 'mongodb://localhost:27017/auto-garage');

  
if (!mongoUri) {
  console.error('❌ MONGO_URI (or MONGODB_URI) must be set in production');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check (always reachable, even when DB is down)
app.get('/api/health', (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  res.status(dbReady ? 200 : 503).json({
    status: dbReady ? 'OK' : 'DEGRADED',
    message: dbReady ? 'Server is running' : 'Database not connected',
    database: dbReady ? 'connected' : 'disconnected',
  });
});

// Fail fast if the database is not connected (avoids 10s buffering timeouts)
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database not connected. Check MONGO_URI on the server and Atlas network access.',
    });
  }
  next();
});

// Routes
app.use('/api/parts', require('./routes/parts'));
app.use('/api/cars', require('./routes/cars'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/auth', require('./routes/auth'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const startServer = async () => {
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      bufferCommands: false,
    });
    console.log('✅ MongoDB connected');

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

startServer();
