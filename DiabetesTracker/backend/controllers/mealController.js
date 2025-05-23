// controllers/mealController.js
const Meal = require('../models/Meal');

// Get all meals
exports.getMeals = async (req, res) => {
  try {
    const meals = await Meal.find({ userId: req.query.userId || 'default' })
      .sort({ timestamp: -1 });
    res.json(meals);
  } catch (error) {
    console.error('Error fetching meals:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add new meal
exports.addMeal = async (req, res) => {
  try {
    const { userId, totalCarbs, foodItems, timestamp } = req.body;
    
    console.log('Adding meal data:', {
      userId: userId || 'default',
      totalCarbs,
      timestamp: timestamp || Date.now(),
      foodItemsCount: foodItems?.length || 0
    });
    
    const newMeal = new Meal({
      userId: userId || 'default',
      totalCarbs,
      foodItems,
      timestamp: timestamp || Date.now()
    });
    
    const savedMeal = await newMeal.save();
    console.log('Meal saved with ID:', savedMeal._id);
    res.status(201).json(savedMeal);
  } catch (error) {
    console.error('Error saving meal:', error);
    res.status(500).json({ message: 'Server error', error: error.toString() });
  }
};