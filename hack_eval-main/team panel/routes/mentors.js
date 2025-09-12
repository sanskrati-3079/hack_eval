const express = require('express');
const router = express.Router();
const Mentor = require('../models/Mentor');
const Team = require('../models/Team');
const { body, validationResult } = require('express-validator');

// Get all mentors
router.get('/', async (req, res) => {
  try {
    const mentors = await Mentor.find({ isActive: true })
      .populate('currentTeams', 'teamName teamId category')
      .sort({ rating: -1 });
    
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get mentor by ID
router.get('/:id', async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id)
      .populate('currentTeams', 'teamName teamId category problemStatement');
    
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }
    
    res.json(mentor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get available mentors by expertise
router.get('/expertise/:expertise', async (req, res) => {
  try {
    const mentors = await Mentor.find({
      expertise: req.params.expertise,
      isActive: true,
      $expr: { $lt: [{ $size: '$currentTeams' }, '$maxTeams'] }
    }).populate('currentTeams', 'teamName teamId');
    
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get currently available mentors
router.get('/available/current', async (req, res) => {
  try {
    const mentors = await Mentor.find({ isActive: true });
    const availableMentors = mentors.filter(mentor => mentor.getCurrentStatus());
    
    res.json(availableMentors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new mentor
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('expertise').isArray({ min: 1 }).withMessage('At least one expertise is required'),
  body('availability').isArray().withMessage('Availability schedule is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const existingMentor = await Mentor.findOne({ email: req.body.email });
    if (existingMentor) {
      return res.status(400).json({ message: 'Mentor with this email already exists' });
    }

    const mentor = new Mentor(req.body);
    await mentor.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('mentor-created', mentor);

    res.status(201).json(mentor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update mentor
router.put('/:id', async (req, res) => {
  try {
    const mentor = await Mentor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('currentTeams', 'teamName teamId category');

    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('mentor-updated', mentor);

    res.json(mentor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Assign mentor to team
router.post('/:mentorId/assign-team/:teamId', async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.mentorId);
    const team = await Team.findById(req.params.teamId);

    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    if (mentor.currentTeams.length >= mentor.maxTeams) {
      return res.status(400).json({ message: 'Mentor has reached maximum team limit' });
    }
    if (team.mentor) {
      return res.status(400).json({ message: 'Team already has a mentor assigned' });
    }

    // Check if mentor has expertise in team's category
    if (!mentor.expertise.includes(team.category)) {
      return res.status(400).json({ message: 'Mentor does not have expertise in this category' });
    }

    mentor.currentTeams.push(team._id);
    team.mentor = mentor._id;

    await mentor.save();
    await team.save();

    const updatedMentor = await Mentor.findById(req.params.mentorId)
      .populate('currentTeams', 'teamName teamId category');

    // Emit real-time updates
    const io = req.app.get('io');
    io.emit('mentor-assigned', { mentor: updatedMentor, team });
    io.to(`team-${team._id}`).emit('mentor-assigned-to-team', updatedMentor);

    res.json(updatedMentor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove mentor from team
router.delete('/:mentorId/remove-team/:teamId', async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.mentorId);
    const team = await Team.findById(req.params.teamId);

    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    mentor.currentTeams = mentor.currentTeams.filter(
      teamId => teamId.toString() !== req.params.teamId
    );
    team.mentor = null;

    await mentor.save();
    await team.save();

    const updatedMentor = await Mentor.findById(req.params.mentorId)
      .populate('currentTeams', 'teamName teamId category');

    // Emit real-time updates
    const io = req.app.get('io');
    io.emit('mentor-removed', { mentor: updatedMentor, team });
    io.to(`team-${team._id}`).emit('mentor-removed-from-team');

    res.json(updatedMentor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get mentor availability for specific time
router.get('/:id/availability/:day/:time', async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    const isAvailable = mentor.isAvailableAt(req.params.day, req.params.time);
    res.json({ isAvailable, mentor });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update mentor availability
router.put('/:id/availability', [
  body('availability').isArray().withMessage('Availability schedule is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    mentor.availability = req.body.availability;
    await mentor.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('mentor-availability-updated', mentor);

    res.json(mentor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Rate mentor
router.post('/:id/rate', [
  body('rating').isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().isString().withMessage('Review must be a string')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    const newTotalRating = mentor.rating * mentor.totalReviews + req.body.rating;
    mentor.totalReviews += 1;
    mentor.rating = newTotalRating / mentor.totalReviews;

    await mentor.save();

    res.json(mentor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 