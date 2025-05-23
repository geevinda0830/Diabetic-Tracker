// backend/models/RawCsvData.js
const mongoose = require('mongoose');

// Dynamic schema to accommodate any columns from CSV
const RawCsvDataSchema = new mongoose.Schema({}, { strict: false, timestamps: true });

module.exports = mongoose.model('RawCsvData', RawCsvDataSchema);