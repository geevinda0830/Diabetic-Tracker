
const mongoose = require('mongoose');

const glucoseReadingSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  mealState: {
    type: String,
    enum: ['fasting', 'before', 'after'],
    default: 'fasting'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GlucoseReading', glucoseReadingSchema);