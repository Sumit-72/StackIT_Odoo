const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  text: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  votes: { type: Number, default: 0 },
  accepted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Answer', answerSchema);