const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  answer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Answer', 
    required: true 
  },
  voteType: { 
    type: String, 
    enum: ['up', 'down'], 
    required: true 
  }
}, { timestamps: true });

// Ensure one user can only vote once per answer
voteSchema.index({ user: 1, answer: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema); 