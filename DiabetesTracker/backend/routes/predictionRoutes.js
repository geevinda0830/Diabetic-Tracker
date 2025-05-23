// backend/routes/predictionRoutes.js
const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const { insulin, carbs, exercise, prevGlucose } = req.body;
  
  // Simple rule-based prediction (will replace with ML)
  const prediction = prevGlucose - (insulin * 20) + (carbs * 4) - (exercise * 3);
  
  res.json({
    prediction: Math.max(70, Math.min(300, prediction)),
    confidence: 0.7
  });
});

module.exports = router;