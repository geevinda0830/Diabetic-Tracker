
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Define schemas
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

const insulinDoseSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  units: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['rapid', 'short', 'intermediate', 'long', 'mix'],
    default: 'rapid'
  },
  bloodGlucose: {
    type: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const mealSchema = new mongoose.Schema({
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

// Create models
const GlucoseReading = mongoose.model('GlucoseReading', glucoseReadingSchema);
const InsulinDose = mongoose.model('InsulinDose', insulinDoseSchema);
const Meal = mongoose.model('Meal', mealSchema);

// API Routes
// Glucose readings
app.get('/api/glucose', async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const readings = await GlucoseReading.find({ userId })
      .sort({ timestamp: -1 });
    return res.json(readings);
  } catch (error) {
    console.error('Error fetching glucose readings:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/glucose', async (req, res) => {
  try {
    const { value, timestamp, notes, mealState } = req.body;
    const userId = req.body.userId || 'default';
    
    const newReading = new GlucoseReading({
      userId,
      value,
      timestamp: timestamp || Date.now(),
      notes: notes || '',
      mealState: mealState || 'fasting'
    });

    const reading = await newReading.save();
    return res.status(201).json(reading);
  } catch (error) {
    console.error('Error saving glucose reading:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Insulin doses
app.get('/api/insulin', async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const doses = await InsulinDose.find({ userId })
      .sort({ timestamp: -1 });
    return res.json(doses);
  } catch (error) {
    console.error('Error fetching insulin doses:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/insulin', async (req, res) => {
  try {
    const { units, type, bloodGlucose, timestamp, notes } = req.body;
    const userId = req.body.userId || 'default';
    
    const newDose = new InsulinDose({
      userId,
      units,
      type: type || 'rapid',
      bloodGlucose,
      timestamp: timestamp || Date.now(),
      notes: notes || ''
    });
    
    const savedDose = await newDose.save();
    return res.status(201).json(savedDose);
  } catch (error) {
    console.error('Error saving insulin dose:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Meals
app.get('/api/meals', async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const meals = await Meal.find({ userId })
      .sort({ timestamp: -1 });
    return res.json(meals);
  } catch (error) {
    console.error('Error fetching meals:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/meals', async (req, res) => {
  try {
    const { totalCarbs, foodItems, timestamp } = req.body;
    const userId = req.body.userId || 'default';
    
    const newMeal = new Meal({
      userId,
      totalCarbs,
      foodItems,
      timestamp: timestamp || Date.now()
    });
    
    const savedMeal = await newMeal.save();
    return res.status(201).json(savedMeal);
  } catch (error) {
    console.error('Error saving meal:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Test route
app.get('/api/test', async (req, res) => {
  try {
    const glucoseCount = await GlucoseReading.countDocuments();
    const insulinCount = await InsulinDose.countDocuments();
    const mealCount = await Meal.countDocuments();
    
    res.json({
      message: "MongoDB connection successful",
      stats: {
        glucoseReadings: glucoseCount,
        insulinDoses: insulinCount,
        meals: mealCount
      }
    });
  } catch (error) {
    console.error('Test route error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test API: http://localhost:${PORT}/api/test`);
});






// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const morgan = require('morgan');

// // Load environment variables
// dotenv.config();

// // Import route files
// const glucoseRoutes = require('./routes/glucoseRoutes');
// // const insulinRoutes = require('./routes/insulinRoutes');
// // const mealRoutes = require('./routes/mealRoutes');
// const predictionRoutes = require('./routes/predictionRoutes');
// // const analysisRoutes = require('./routes/analysisRoutes');

// // Initialize Express app
// const app = express();
// const PORT = process.env.PORT || 5001;

// // Connect to MongoDB with retry logic
// const connectWithRetry = () => {
//   const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/diabetes_tracker';
  
//   mongoose.connect(MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => {
//     console.log('MongoDB Connected Successfully!');
//   })
//   .catch(err => {
//     console.error('MongoDB connection error:', err);
//     console.log('Retrying connection in 5 seconds...');
//     setTimeout(connectWithRetry, 5000);
//   });
// };

// // Initial connection attempt
// connectWithRetry();

// // Handle MongoDB connection events
// mongoose.connection.on('error', err => {
//   console.error('MongoDB connection error:', err);
// });

// mongoose.connection.on('disconnected', () => {
//   console.log('MongoDB disconnected. Attempting to reconnect...');
//   setTimeout(connectWithRetry, 5000);
// });

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Request logger
// app.use(morgan('dev'));

// // Add request logging middleware
// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.url} - Body:`, req.body);
//   next();
// });

// // Routes
// app.use('/api/glucose', glucoseRoutes);
// // app.use('/api/insulin', insulinRoutes);
// // app.use('/api/meals', mealRoutes);
// app.use('/api/predict-insulin', predictionRoutes);
// // app.use('/api/analysis', analysisRoutes);

// // Base route for API health check
// app.get('/api', (req, res) => {
//   res.json({ message: 'Diabetes Tracker API is running' });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error('Unhandled error:', err);
//   res.status(500).json({ error: 'Server error', message: err.message });
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// module.exports = app;