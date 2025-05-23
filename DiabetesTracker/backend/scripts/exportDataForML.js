// backend/scripts/exportDataForML.js
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const RawCsvData = require('../models/RawCsvData');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const exportData = async () => {
  try {
    // Create directory if it doesn't exist
    const outputDir = path.join(__dirname, '../../ml_model/data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Fetch data from MongoDB
    const data = await RawCsvData.find({}).lean();
    console.log(`Fetched ${data.length} records from MongoDB`);
    
    // Write to JSON file
    const outputPath = path.join(outputDir, 'raw_data.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`Data exported to ${outputPath}`);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Export error:', error);
    mongoose.disconnect();
    process.exit(1);
  }
};

exportData();