const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Notification = require('../models/Notification');
const User = require('../models/User');
const auth = require('../middleware/auth');

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
    
    question.answers.push(newAnswer._id);
    await question.save();
    
    try {
      if (question.user.toString() !== req.user.id) {
        const notification = new Notification({
          user: question.user,
          type: 'new_answer',
          title: 'New Answer to Your Question',
          message: `${req.user.username} answered your question "${question.title}"`,
          question: question._id,
          answer: newAnswer._id
        });
        await notification.save();
      }
    } catch (notificationError) {
      console.error('Error creating answer notification:', notificationError);
    }
    
    res.status(201).json(newAnswer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

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
    
    try {
      const allUsers = await User.find({ _id: { $ne: req.user.id } });
      const notifications = allUsers.map(user => ({
        user: user._id,
        type: 'new_question',
        title: 'New Question Posted',
        message: `A new question "${req.body.title}" has been posted`,
        question: newQuestion._id
      }));
      
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    } catch (notificationError) {
      console.error('Error creating notifications:', notificationError);
    }
    
    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

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

router.delete('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    if (question.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await Notification.deleteMany({ question: question._id });
    
    
    await question.deleteOne();
    res.json({ message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 