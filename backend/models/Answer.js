const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  text: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  accepted: { type: Boolean, default: false }
}, { timestamps: true });

// Virtual for vote count (will be calculated dynamically)
answerSchema.virtual('votes').get(function() {
  return this._votes || 0;
});

answerSchema.set('toJSON', { virtuals: true });
answerSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Answer', answerSchema);