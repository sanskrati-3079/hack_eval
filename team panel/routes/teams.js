const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const { body, validationResult } = require('express-validator');

// Get all teams
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find({ isActive: true })
      .populate('mentor', 'name email avatar expertise')
      .select('-submissions.files')
      .sort({ totalScore: -1 });
    
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get team by ID
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('mentor', 'name email avatar expertise availability');
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get team by team ID
router.get('/team/:teamId', async (req, res) => {
  try {
    const team = await Team.findOne({ teamId: req.params.teamId })
      .populate('mentor', 'name email avatar expertise availability');
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new team
router.post('/', [
  body('teamId').notEmpty().withMessage('Team ID is required'),
  body('teamName').notEmpty().withMessage('Team name is required'),
  body('problemStatement').notEmpty().withMessage('Problem statement is required'),
  body('category').isIn(['AI/ML', 'Web Development', 'Mobile Development', 'Cybersecurity', 'IoT', 'Blockchain']).withMessage('Invalid category'),
  body('members').isArray({ min: 1, max: 4 }).withMessage('Team must have 1-4 members')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const existingTeam = await Team.findOne({ teamId: req.body.teamId });
    if (existingTeam) {
      return res.status(400).json({ message: 'Team ID already exists' });
    }

    const team = new Team(req.body);
    await team.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('team-created', team);

    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update team
router.put('/:id', async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('mentor', 'name email avatar expertise');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`team-${team._id}`).emit('team-updated', team);

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add member contribution
router.post('/:id/contributions', [
  body('memberEmail').isEmail().withMessage('Valid member email is required'),
  body('type').isIn(['code', 'design', 'research', 'documentation', 'presentation']).withMessage('Invalid contribution type'),
  body('description').notEmpty().withMessage('Description is required'),
  body('hours').isFloat({ min: 0 }).withMessage('Hours must be a positive number')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const member = team.members.find(m => m.email === req.body.memberEmail);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const contribution = {
      type: req.body.type,
      description: req.body.description,
      hours: req.body.hours,
      date: new Date()
    };

    member.contributions.push(contribution);
    member.totalHours += req.body.hours;

    await team.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`team-${team._id}`).emit('contribution-added', { team, contribution });

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get team analytics
router.get('/:id/analytics', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const analytics = {
      totalMembers: team.members.length,
      totalHours: team.calculateTotalHours(),
      projectProgress: team.calculateProgress(),
      submissionsCount: team.submissions.length,
      averageScore: team.submissions.length > 0 
        ? team.submissions.reduce((sum, sub) => sum + (sub.score || 0), 0) / team.submissions.length 
        : 0,
      memberContributions: team.members.map(member => ({
        name: member.name,
        role: member.role,
        totalHours: member.totalHours,
        contributionsCount: member.contributions.length,
        lastContribution: member.contributions.length > 0 
          ? member.contributions[member.contributions.length - 1].date 
          : null
      })),
      categoryRank: team.rank.category,
      overallRank: team.rank.overall
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get teams by category
router.get('/category/:category', async (req, res) => {
  try {
    const teams = await Team.find({ 
      category: req.params.category,
      isActive: true 
    })
    .populate('mentor', 'name email avatar')
    .select('-submissions.files')
    .sort({ totalScore: -1 });

    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 