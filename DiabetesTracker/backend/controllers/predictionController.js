// controllers/predictionController.js
const Prediction = require('../models/Prediction');

// Get all predictions
exports.getPredictions = async (req, res) => {
  try {
    const predictions = await Prediction.find({ userId: req.query.userId || 'default' })
      .sort({ timestamp: -1 });
    res.json(predictions);
  } catch (error) {
    console.error('Error fetching predictions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add new prediction
exports.addPrediction = async (req, res) => {
  try {
    const { 
      userId, 
      predictedValue, 
      confidence, 
      method,
      inputs
    } = req.body;
    
    const newPrediction = new Prediction({
      userId: userId || 'default',
      predictedValue,
      confidence,
      method,
      inputs,
      timestamp: Date.now()
    });
    
    const savedPrediction = await newPrediction.save();
    res.status(201).json(savedPrediction);
  } catch (error) {
    console.error('Error saving prediction:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Predict insulin dose
// exports.predictInsulin = async (req, res) => {
//   try {
//     const { 
//       bloodGlucose, 
//       carbIntake, 
//       exerciseTime, 
//       currentInsulinDosage,
//       weight,
//       userId
//     } = req.body;
    
//     console.log("Received prediction request:", req.body);
    
//     // Simple prediction logic (can be replaced with ML model)
//     const targetGlucose = 120;
//     const glucoseDifference = bloodGlucose - targetGlucose;
//     const carbEffect = carbIntake / 10;
//     const exerciseReduction = exerciseTime * 0.2;
//     const glucoseAdjustment = glucoseDifference > 0 
//       ? Math.ceil(glucoseDifference / 30) 
//       : Math.floor(glucoseDifference / 30);

//     let recommendedDosage = currentInsulinDosage + glucoseAdjustment + carbEffect;
//     recommendedDosage = Math.max(0, recommendedDosage - exerciseReduction);
//     recommendedDosage = Math.round(recommendedDosage * 2) / 2; // Round to nearest 0.5
    
//     // Save prediction to database
//     const newPrediction = new Prediction({
//       userId: userId || 'default',
//       predictedValue: recommendedDosage,
//       confidence: 0.7,
//       method: 'local-fallback',
//       inputs: {
//         currentGlucose: bloodGlucose,
//         carbs: carbIntake,
//         exerciseDuration: exerciseTime,
//         weight
//       },
//       timestamp: Date.now()
//     });
    
//     await newPrediction.save();
    
//     // Return response
//     res.json({
//       recommendedDosage,
//       details: {
//         currentGlucose: bloodGlucose,
//         glucoseDifference: glucoseDifference.toFixed(1),
//         carbEffect: carbEffect.toFixed(1),
//         exerciseReduction: exerciseReduction.toFixed(1)
//       },
//       method: 'local-fallback',
//       confidence: 0.7
//     });
//   } catch (error) {
//     console.error('Error in insulin prediction:', error);
//     res.status(500).json({ error: 'Prediction error' });
//   }
// };

exports.predictInsulin = async (req, res) => {
  try {
    const { 
      bloodGlucose, 
      carbIntake, 
      exerciseTime, 
      currentInsulinDosage,
      weight,
      userId
    } = req.body;
    
    console.log("Received prediction request:", req.body);
    
    // Simple prediction logic (can be replaced with ML model)
    const targetGlucose = 120;
    const glucoseDifference = bloodGlucose - targetGlucose;
    const carbEffect = carbIntake / 10;
    const exerciseReduction = exerciseTime * 0.2;
    const glucoseAdjustment = glucoseDifference > 0 
      ? Math.ceil(glucoseDifference / 30) 
      : Math.floor(glucoseDifference / 30);

    let recommendedDosage = currentInsulinDosage + glucoseAdjustment + carbEffect;
    recommendedDosage = Math.max(0, recommendedDosage - exerciseReduction);
    recommendedDosage = Math.round(recommendedDosage * 2) / 2; // Round to nearest 0.5
    
    // Save prediction to database
    try {
      const newPrediction = new Prediction({
        userId: userId || 'default',
        predictedValue: recommendedDosage,
        confidence: 0.7,
        method: 'local-fallback',
        inputs: {
          currentGlucose: bloodGlucose,
          carbs: carbIntake,
          exerciseDuration: exerciseTime,
          weight
        },
        timestamp: Date.now()
      });
      
      const savedPrediction = await newPrediction.save();
      console.log("Prediction saved with ID:", savedPrediction._id);
    } catch (saveError) {
      console.error("Error saving prediction:", saveError);
      // Continue even if saving fails - don't return error to client
    }
    
    // Return response
    res.json({
      recommendedDosage,
      details: {
        currentGlucose: bloodGlucose,
        glucoseDifference: glucoseDifference.toFixed(1),
        carbEffect: carbEffect.toFixed(1),
        exerciseReduction: exerciseReduction.toFixed(1)
      },
      method: 'local-fallback',
      confidence: 0.7
    });
  } catch (error) {
    console.error('Error in insulin prediction:', error);
    res.status(500).json({ error: 'Prediction error', message: error.toString() });
  }
};