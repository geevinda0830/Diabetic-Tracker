// controllers/insulinController.js
const InsulinDose = require('../models/InsulinDose');

// Get all insulin doses
exports.getInsulinDoses = async (req, res) => {
  try {
    const doses = await InsulinDose.find({ userId: req.query.userId || 'default' })
      .sort({ timestamp: -1 });
    res.json(doses);
  } catch (error) {
    console.error('Error fetching insulin doses:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add new insulin dose
exports.addInsulinDose = async (req, res) => {
  try {
    const { userId, units, type, bloodGlucose, timestamp, notes } = req.body;
    
    console.log('Adding insulin dose:', {
      userId: userId || 'default',
      units,
      type,
      bloodGlucose,
      timestamp: timestamp || Date.now()
    });
    
    const newDose = new InsulinDose({
      userId: userId || 'default',
      units,
      type,
      bloodGlucose,
      timestamp: timestamp || Date.now(),
      notes
    });
    
    const savedDose = await newDose.save();
    console.log('Insulin dose saved with ID:', savedDose._id);
    res.status(201).json(savedDose);
  } catch (error) {
    console.error('Error saving insulin dose:', error);
    res.status(500).json({ message: 'Server error', error: error.toString() });
  }
};