const express = require('express');
const router = express.Router();
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const auth = require('../middleware/auth');

// Get answers for a question
router.get('/question/:questionId', async (req, res) => {
  try {
    const answers = await Answer.find({ question: req.params.questionId })
      .populate('user', 'username')
      .sort({ votes: -1, createdAt: -1 });
    res.json(answers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create answer
router.post('/question/:questionId', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answer = new Answer({
      text: req.body.text,
      user: req.user.id,
      question: req.params.questionId
    });
    
    const newAnswer = await answer.save();
    await newAnswer.populate('user', 'username');
    
    // Add answer to question
    question.answers.push(newAnswer._id);
    await question.save();
    
    res.status(201).json(newAnswer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update answer
router.patch('/:id', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }
    
    if (answer.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    Object.assign(answer, req.body);
    const updatedAnswer = await answer.save();
    await updatedAnswer.populate('user', 'username');
    res.json(updatedAnswer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete answer
router.delete('/:id', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }
    
    if (answer.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Remove answer from question
    await Question.findByIdAndUpdate(answer.question, {
      $pull: { answers: answer._id }
    });
    
    await answer.deleteOne();
    res.json({ message: 'Answer deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Vote on answer
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }
    
    const { voteType } = req.body; // 'up' or 'down'
    
    if (voteType === 'up') {
      answer.votes += 1;
    } else if (voteType === 'down') {
      answer.votes -= 1;
    }
    
    const updatedAnswer = await answer.save();
    await updatedAnswer.populate('user', 'username');
    res.json(updatedAnswer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 