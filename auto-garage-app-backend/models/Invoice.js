const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['part', 'service'],
    default: 'part'
  },
  name: {
    type: String,
    required: true
  },
  partId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Part',
    required: false
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: false
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerPhone: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  items: [invoiceItemSchema],
  total: {
    type: Number,
    required: true,
    min: 0
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Invoice', invoiceSchema);
