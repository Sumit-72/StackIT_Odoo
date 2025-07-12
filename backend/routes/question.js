const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const auth = require('../middleware/auth');

// Get all questions
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find()
      .populate('user', 'username')
      .sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single question
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('user', 'username');
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get answers for a question
router.get('/:id/answers', async (req, res) => {
  try {
    const answers = await Answer.find({ question: req.params.id })
      .populate('user', 'username')
      .sort({ votes: -1, createdAt: -1 });
    res.json(answers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create answer for a question
router.post('/:id/answers', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answer = new Answer({
      text: req.body.text,
      user: req.user.id,
      question: req.params.id
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

// Create question
router.post('/', auth, async (req, res) => {
  try {
    const question = new Question({
      title: req.body.title,
      description: req.body.description,
      tags: req.body.tags || [],
      user: req.user.id
    });
    const newQuestion = await question.save();
    await newQuestion.populate('user', 'username');
    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update question
router.patch('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    if (question.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    Object.assign(question, req.body);
    const updatedQuestion = await question.save();
    await updatedQuestion.populate('user', 'username');
    res.json(updatedQuestion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete question
router.delete('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    if (question.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await question.deleteOne();
    res.json({ message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 