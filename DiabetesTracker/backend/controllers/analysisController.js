// controllers/analysisController.js
const GlucoseReading = require('../models/GlucoseReading');
const InsulinDose = require('../models/InsulinDose');
const Meal = require('../models/Meal');

// Get carb and glucose correlation data
exports.getCarbGlucoseAnalysis = async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const daysAgo = parseInt(req.query.days) || 30; // Default to 30 days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Get glucose readings
    const glucoseReadings = await GlucoseReading.find({
      userId,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: 1 });

    // Get meal data
    const meals = await Meal.find({
      userId,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: 1 });

    // Get insulin doses
    const insulinDoses = await InsulinDose.find({
      userId,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: 1 });

    res.json({
      glucoseReadings,
      meals,
      insulinDoses,
      analysisMetadata: {
        days: daysAgo,
        startDate,
        endDate: new Date(),
        totalReadings: glucoseReadings.length,
        totalMeals: meals.length,
        totalInsulinDoses: insulinDoses.length
      }
    });
  } catch (error) {
    console.error('Error fetching analysis data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get average glucose by meal state
exports.getGlucoseByMealState = async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const daysAgo = parseInt(req.query.days) || 14; // Default to 14 days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Get glucose readings grouped by meal state
    const glucoseReadings = await GlucoseReading.find({
      userId,
      timestamp: { $gte: startDate }
    });

    // Group by meal state
    const groupedReadings = {
      fasting: [],
      before: [],
      after: []
    };

    glucoseReadings.forEach(reading => {
      const state = reading.mealState || 'fasting';
      groupedReadings[state].push(reading.value);
    });

    // Calculate averages
    const averages = {};
    for (const state in groupedReadings) {
      const values = groupedReadings[state];
      if (values.length > 0) {
        averages[state] = values.reduce((sum, val) => sum + val, 0) / values.length;
      } else {
        averages[state] = 0;
      }
    }

    res.json({
      averages,
      counts: {
        fasting: groupedReadings.fasting.length,
        before: groupedReadings.before.length,
        after: groupedReadings.after.length
      },
      analysisMetadata: {
        days: daysAgo,
        startDate,
        endDate: new Date(),
        totalReadings: glucoseReadings.length
      }
    });
  } catch (error) {
    console.error('Error fetching meal state analysis:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get daily carb intake
exports.getDailyCarbIntake = async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const daysAgo = parseInt(req.query.days) || 14; // Default to 14 days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Get meal data
    const meals = await Meal.find({
      userId,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: 1 });

    // Group by day
    const dailyCarbs = {};
    
    meals.forEach(meal => {
      const date = new Date(meal.timestamp).toISOString().split('T')[0];
      if (!dailyCarbs[date]) {
        dailyCarbs[date] = 0;
      }
      dailyCarbs[date] += meal.totalCarbs;
    });

    // Convert to array for easier consumption by client
    const result = Object.keys(dailyCarbs).map(date => ({
      date,
      carbs: dailyCarbs[date],
      formattedDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));

    res.json({
      dailyCarbs: result,
      analysisMetadata: {
        days: daysAgo,
        startDate,
        endDate: new Date(),
        totalMeals: meals.length,
        averageDailyCarbs: result.length > 0 
          ? result.reduce((sum, day) => sum + day.carbs, 0) / result.length 
          : 0
      }
    });
  } catch (error) {
    console.error('Error fetching daily carb intake:', error);
    res.status(500).json({ message: 'Server error' });
  }
};