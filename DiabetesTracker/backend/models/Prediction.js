const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  predictedValue: { 
    type: Number, 
    required: true 
  },
  confidence: { 
    type: Number 
  },
  method: {
    type: String,
    enum: ['ml-model', 'local-fallback'],
    default: 'local-fallback'
  },
  inputs: {
    currentGlucose: Number,
    insulin: Number,
    carbs: Number,
    exerciseDuration: Number,
    exerciseIntensity: Number,
    weight: Number
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Prediction', PredictionSchema);