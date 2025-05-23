
const GlucoseReading = require('../models/GlucoseReading');

// Get all readings
exports.getReadings = async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const readings = await GlucoseReading.find({ userId })
      .sort({ timestamp: -1 });
    return res.json(readings);
  } catch (error) {
    console.error('Error fetching glucose readings:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Add new reading
exports.addReading = async (req, res) => {
  try {
    // Ensure userId is included
    const { value, timestamp, notes, mealState } = req.body;
    const userId = req.body.userId || 'default'; // Use 'default' if no userId provided
    
    console.log('Adding glucose reading:', req.body);
    
    const newReading = new GlucoseReading({
      userId,
      value,
      timestamp: timestamp || Date.now(),
      notes: notes || '',
      mealState: mealState || 'fasting'
    });

    const reading = await newReading.save();
    console.log('Glucose reading saved:', reading._id);
    return res.status(201).json(reading);
  } catch (error) {
    console.error('Error saving glucose reading:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update reading
exports.updateReading = async (req, res) => {
  try {
    const reading = await GlucoseReading.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!reading) {
      return res.status(404).json({ message: 'Reading not found' });
    }
    
    return res.json(reading);
  } catch (error) {
    console.error('Error updating glucose reading:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Delete reading
exports.deleteReading = async (req, res) => {
  try {
    const reading = await GlucoseReading.findByIdAndDelete(req.params.id);
    
    if (!reading) {
      return res.status(404).json({ message: 'Reading not found' });
    }
    
    return res.json({ message: 'Reading removed' });
  } catch (error) {
    console.error('Error deleting glucose reading:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};