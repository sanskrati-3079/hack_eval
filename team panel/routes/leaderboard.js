const express = require('express');
const router = express.Router();
const Team = require('../models/Team');

// Get overall leaderboard
router.get('/overall', async (req, res) => {
  try {
    const teams = await Team.find({ isActive: true })
      .populate('mentor', 'name')
      .select('teamId teamName category totalScore rank projectProgress')
      .sort({ totalScore: -1 })
      .limit(50);

    // Update ranks
    teams.forEach((team, index) => {
      team.rank.overall = index + 1;
    });

    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get category-wise leaderboard
router.get('/category/:category', async (req, res) => {
  try {
    const teams = await Team.find({ 
      category: req.params.category,
      isActive: true 
    })
    .populate('mentor', 'name')
    .select('teamId teamName totalScore rank projectProgress')
    .sort({ totalScore: -1 })
    .limit(20);

    // Update category ranks
    teams.forEach((team, index) => {
      team.rank.category = index + 1;
    });

    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get top performers
router.get('/top-performers', async (req, res) => {
  try {
    const { limit = 10, category } = req.query;
    
    let query = { isActive: true };
    if (category) {
      query.category = category;
    }

    const teams = await Team.find(query)
      .populate('mentor', 'name')
      .select('teamId teamName category totalScore rank projectProgress')
      .sort({ totalScore: -1 })
      .limit(parseInt(limit));

    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get leaderboard statistics
router.get('/stats', async (req, res) => {
  try {
    const teams = await Team.find({ isActive: true });
    
    const stats = {
      totalTeams: teams.length,
      averageScore: teams.length > 0 
        ? teams.reduce((sum, team) => sum + team.totalScore, 0) / teams.length 
        : 0,
      highestScore: teams.length > 0 
        ? Math.max(...teams.map(team => team.totalScore))
        : 0,
      lowestScore: teams.length > 0 
        ? Math.min(...teams.map(team => team.totalScore))
        : 0,
      categoryStats: {}
    };

    // Calculate category statistics
    const categories = ['AI/ML', 'Web Development', 'Mobile Development', 'Cybersecurity', 'IoT', 'Blockchain'];
    categories.forEach(category => {
      const categoryTeams = teams.filter(team => team.category === category);
      if (categoryTeams.length > 0) {
        stats.categoryStats[category] = {
          totalTeams: categoryTeams.length,
          averageScore: categoryTeams.reduce((sum, team) => sum + team.totalScore, 0) / categoryTeams.length,
          highestScore: Math.max(...categoryTeams.map(team => team.totalScore)),
          lowestScore: Math.min(...categoryTeams.map(team => team.totalScore))
        };
      }
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 