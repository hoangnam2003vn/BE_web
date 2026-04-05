const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  messageContent: {
    type: {
      type: String,
      enum: ['file', 'text'],
      required: true
    },
    text: { type: String, required: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
