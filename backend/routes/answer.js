const express = require('express');
const router = express.Router();
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const Vote = require('../models/Vote');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

router.get('/question/:questionId', async (req, res) => {
  try {
    const answers = await Answer.find({ question: req.params.questionId })
      .populate('user', 'username');
    
    const answersWithVotes = await Promise.all(answers.map(async (answer) => {
      const upvotes = await Vote.countDocuments({ answer: answer._id, voteType: 'up' });
      const downvotes = await Vote.countDocuments({ answer: answer._id, voteType: 'down' });
      const totalVotes = upvotes - downvotes;
      
      const answerObj = answer.toObject();
      answerObj.votes = totalVotes;
      return answerObj;
    }));
    
    answersWithVotes.sort((a, b) => {
      if (b.votes !== a.votes) {
        return b.votes - a.votes;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    res.json(answersWithVotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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
    
    question.answers.push(newAnswer._id);
    await question.save();
    
    res.status(201).json(newAnswer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

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

router.delete('/:id', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }
    
    if (answer.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own answers' });
    }
    
    await Question.findByIdAndUpdate(answer.question, {
      $pull: { answers: answer._id }
    });
    
    await Vote.deleteMany({ answer: answer._id });
    
    await Notification.deleteMany({ answer: answer._id });
    
    await answer.deleteOne();
    res.json({ message: 'Answer deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/vote', auth, async (req, res) => {
  try {
    const vote = await Vote.findOne({
      user: req.user.id,
      answer: req.params.id
    });
    
    res.json({ voteType: vote ? vote.voteType : null });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/:id/vote', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }
    
    const { voteType } = req.body;
    
    if (!['up', 'down'].includes(voteType)) {
      return res.status(400).json({ message: 'Invalid vote type' });
    }
    
    let existingVote = await Vote.findOne({
      user: req.user.id,
      answer: answer._id
    });
    
    if (existingVote) {
      if (existingVote.voteType === voteType) {
        await existingVote.deleteOne();
      } else {
        existingVote.voteType = voteType;
        await existingVote.save();
      }
    } else {
      existingVote = new Vote({
        user: req.user.id,
        answer: answer._id,
        voteType: voteType
      });
      await existingVote.save();
    }
    
    const upvotes = await Vote.countDocuments({ answer: answer._id, voteType: 'up' });
    const downvotes = await Vote.countDocuments({ answer: answer._id, voteType: 'down' });
    const totalVotes = upvotes - downvotes;
    
    answer._votes = totalVotes;
    
    const updatedAnswer = await answer.populate('user', 'username');
    res.json(updatedAnswer);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already voted on this answer' });
    }
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 