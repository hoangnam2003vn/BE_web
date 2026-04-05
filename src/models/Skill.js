const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: Number, min: 0, max: 100, default: 0 },
  category: { type: String, enum: ['Frontend', 'Backend'], default: 'Frontend' }
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);
