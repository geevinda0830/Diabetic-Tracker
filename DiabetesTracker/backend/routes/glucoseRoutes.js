// backend/routes/glucoseRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getReadings, 
  addReading, 
  updateReading, 
  deleteReading 
} = require('../controllers/glucoseController');


// GET /api/glucose
router.get('/', (req, res) => {
  // For now, return mock data
  res.json([
    { id: 1, timestamp: new Date(), value: 120 },
    { id: 2, timestamp: new Date(), value: 135 }
  ]);
});

// POST /api/glucose
router.post('/', (req, res) => {
  console.log('Received data:', req.body);
  res.json({ success: true, data: req.body });
});

module.exports = router;

// PUT /api/glucose/:id
router.put('/:id', updateReading);

// DELETE /api/glucose/:id
router.delete('/:id', deleteReading);

module.exports = router;