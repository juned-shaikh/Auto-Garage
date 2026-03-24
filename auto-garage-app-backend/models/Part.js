const mongoose = require('mongoose');

const partSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Engine', 'Brakes', 'Electrical', 'Body', 'Suspension', 'Transmission', 'Other']
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  minQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 5
  },
  buyPrice: {
    type: Number,
    required: true,
    min: 0
  },
  sellPrice: {
    type: Number,
    required: true,
    min: 0
  },
  supplier: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Part', partSchema);
