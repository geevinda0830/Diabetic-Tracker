
const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true 
  },
  totalCarbs: { 
    type: Number, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  foodItems: [{ 
    name: String, 
    carbsPer100g: Number, 
    weight: Number, 
    carbs: Number 
  }]
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Meal', MealSchema);