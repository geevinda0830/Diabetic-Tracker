const mongoose = require('mongoose');

const insulinDoseSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  units: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['rapid', 'short', 'intermediate', 'long', 'mix'],
    default: 'rapid'
  },
  bloodGlucose: {
    type: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('InsulinDose', insulinDoseSchema);