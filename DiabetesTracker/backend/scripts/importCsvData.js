// backend/scripts/importCsvData.js
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Import raw data (for ML training)
const importCsvToMongo = async (filePath, model) => {
  const records = [];
  
  // Parse CSV file
  const parser = fs
    .createReadStream(filePath)
    .pipe(parse({
      columns: true,
      skip_empty_lines: true
    }));
  
  for await (const record of parser) {
    records.push(record);
  }
  
  console.log(`Parsed ${records.length} records from ${path.basename(filePath)}`);
  
  try {
    await model.insertMany(records);
    console.log(`Imported ${records.length} records to MongoDB`);
  } catch (error) {
    console.error('Import error:', error);
  }
};

const run = async () => {
  // You'll need to create the RawCsvData model
  const RawCsvData = require('../models/RawCsvData');
  
  // CSV file paths - update these to your actual file locations
  const csvFiles = [
    path.join(__dirname, '/Users/malithgeevinda/DiabetesTracker/ml_model/data/1.csv'),
    path.join(__dirname, '../../data/2.csv'),
    path.join(__dirname, '../../data/3.csv'),
    path.join(__dirname, '../../data/4.csv'),
    path.join(__dirname, '../../data/5.csv'),
    path.join(__dirname, '../../data/6.csv')
  ];
  
  for (const file of csvFiles) {
    await importCsvToMongo(file, RawCsvData);
  }
  
  console.log('Import complete!');
  mongoose.disconnect();
};

run().catch(console.error);