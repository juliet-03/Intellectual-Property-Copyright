// server/models/Client.js
const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: String,
  phone: String,
  location: String,
  amountOwed: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'overdue', 'paid'],
    default: 'active',
  },
  riskScore: {
    type: Number,
    default: 0, // 0–100 risk score based on behavior
  },
  lastContacted: Date,
  notes: [String],
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
