const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  make: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  vin: {
    type: String,
    required: true,
    trim: true,
    maxlength: 17
  },
  type: {
    type: String,
    required: true,
    enum: ['buy', 'sell']
  },
  buyPrice: {
    type: Number,
    required: true,
    min: 0
  },
  sellPrice: {
    type: Number,
    min: 0,
    default: 0
  },
  profit: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    required: true
  },
  customer: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Calculate profit before saving
carSchema.pre('save', function(next) {
  if (this.type === 'sell' && this.sellPrice > 0) {
    this.profit = this.sellPrice - this.buyPrice;
  } else {
    this.profit = 0;
  }
  next();
});

module.exports = mongoose.model('Car', carSchema);
