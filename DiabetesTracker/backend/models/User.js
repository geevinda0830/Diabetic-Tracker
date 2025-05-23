// // backend/models/User.js
// const mongoose = require('mongoose');

// const UserSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   weight: { type: Number },
//   dateOfBirth: { type: Date },
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('User', UserSchema);

// server/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: false
  },
  weight: {
    type: Number,
    required: false
  },
  height: {
    type: Number,
    required: false
  },
  diabetesType: {
    type: String,
    enum: ['Type 1', 'Type 2', 'Gestational', 'Other'],
    required: false
  },
  diagnosisYear: {
    type: Number,
    required: false
  },
  targetRange: {
    min: {
      type: Number,
      default: 70
    },
    max: {
      type: Number,
      default: 180
    }
  },
  profileComplete: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);