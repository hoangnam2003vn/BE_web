const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  color: { type: String, default: '#000000' }
}, { timestamps: true });

module.exports = mongoose.model('Tag', tagSchema);
