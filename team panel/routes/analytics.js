const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');
const Team = require('../models/Team');
const Mentor = require('../models/Mentor');

// Get overall analytics
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find({ isActive: true });
    const mentors = await Mentor.find({ isActive: true });
    
    // Calculate analytics
    const analytics = {
      totalTeams: teams.length,
      totalParticipants: teams.reduce((sum, team) => sum + team.members.length, 0),
      submissionsByRound: {
        IST: { total: 0, qualified: 0, notQualified: 0 },
        'Round 1': { total: 0, qualified: 0, notQualified: 0 },
        'Round 2': { total: 0, qualified: 0, notQualified: 0 }
      },
      submissionsByCategory: {
        'AI/ML': 0,
        'Web Development': 0,
        'Mobile Development': 0,
        'Cybersecurity': 0,
        'IoT': 0,
        'Blockchain': 0
      },
      mentorStats: {
        totalMentors: mentors.length,
        activeMentors: mentors.filter(m => m.getCurrentStatus()).length,
        averageRating: mentors.length > 0 
          ? mentors.reduce((sum, m) => sum + m.rating, 0) / mentors.length 
          : 0,
        totalSessions: mentors.reduce((sum, m) => sum + m.currentTeams.length, 0)
      },
      projectProgress: {
        averageProgress: teams.length > 0 
          ? teams.reduce((sum, team) => sum + team.calculateProgress(), 0) / teams.length 
          : 0,
        completedProjects: teams.filter(team => team.calculateProgress() === 100).length,
        inProgressProjects: teams.filter(team => team.calculateProgress() > 0 && team.calculateProgress() < 100).length
      },
      activityMetrics: {
        totalContributions: teams.reduce((sum, team) => 
          sum + team.members.reduce((memberSum, member) => 
            memberSum + member.contributions.length, 0), 0),
        averageHoursPerTeam: teams.length > 0 
          ? teams.reduce((sum, team) => sum + team.calculateTotalHours(), 0) / teams.length 
          : 0,
        mostActiveCategory: getMostActiveCategory(teams),
        peakActivityTime: getPeakActivityTime(teams)
      }
    };

    // Calculate submission statistics
    teams.forEach(team => {
      analytics.submissionsByCategory[team.category]++;
      
      team.submissions.forEach(submission => {
        const round = submission.round;
        analytics.submissionsByRound[round].total++;
        
        if (submission.status === 'qualified') {
          analytics.submissionsByRound[round].qualified++;
        } else if (submission.status === 'not-qualified') {
          analytics.submissionsByRound[round].notQualified++;
        }
      });
    });

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get analytics by date range
router.get('/date-range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const analytics = await Analytics.getAnalyticsByDateRange(
      new Date(startDate),
      new Date(endDate)
    );

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get category-wise analytics
router.get('/category/:category', async (req, res) => {
  try {
    const teams = await Team.find({ 
      category: req.params.category,
      isActive: true 
    });

    const analytics = {
      category: req.params.category,
      totalTeams: teams.length,
      totalParticipants: teams.reduce((sum, team) => sum + team.members.length, 0),
      averageScore: teams.length > 0 
        ? teams.reduce((sum, team) => sum + team.totalScore, 0) / teams.length 
        : 0,
      averageProgress: teams.length > 0 
        ? teams.reduce((sum, team) => sum + team.calculateProgress(), 0) / teams.length 
        : 0,
      submissionsByRound: {
        IST: { total: 0, qualified: 0, notQualified: 0 },
        'Round 1': { total: 0, qualified: 0, notQualified: 0 },
        'Round 2': { total: 0, qualified: 0, notQualified: 0 }
      },
      topTeams: teams
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, 5)
        .map(team => ({
          teamId: team.teamId,
          teamName: team.teamName,
          totalScore: team.totalScore,
          progress: team.calculateProgress()
        }))
    };

    // Calculate submission statistics for category
    teams.forEach(team => {
      team.submissions.forEach(submission => {
        const round = submission.round;
        analytics.submissionsByRound[round].total++;
        
        if (submission.status === 'qualified') {
          analytics.submissionsByRound[round].qualified++;
        } else if (submission.status === 'not-qualified') {
          analytics.submissionsByRound[round].notQualified++;
        }
      });
    });

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get mentor analytics
router.get('/mentors', async (req, res) => {
  try {
    const mentors = await Mentor.find({ isActive: true })
      .populate('currentTeams', 'teamName teamId category');

    const analytics = {
      totalMentors: mentors.length,
      activeMentors: mentors.filter(m => m.getCurrentStatus()).length,
      averageRating: mentors.length > 0 
        ? mentors.reduce((sum, m) => sum + m.rating, 0) / mentors.length 
        : 0,
      expertiseDistribution: {},
      topMentors: mentors
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5)
        .map(mentor => ({
          name: mentor.name,
          rating: mentor.rating,
          totalReviews: mentor.totalReviews,
          currentTeams: mentor.currentTeams.length,
          expertise: mentor.expertise
        })),
      availabilityStats: {
        available: mentors.filter(m => m.getCurrentStatus()).length,
        unavailable: mentors.filter(m => !m.getCurrentStatus()).length
      }
    };

    // Calculate expertise distribution
    mentors.forEach(mentor => {
      mentor.expertise.forEach(exp => {
        analytics.expertiseDistribution[exp] = (analytics.expertiseDistribution[exp] || 0) + 1;
      });
    });

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get team performance analytics
router.get('/teams/performance', async (req, res) => {
  try {
    const teams = await Team.find({ isActive: true });

    const analytics = {
      totalTeams: teams.length,
      averageScore: teams.length > 0 
        ? teams.reduce((sum, team) => sum + team.totalScore, 0) / teams.length 
        : 0,
      averageProgress: teams.length > 0 
        ? teams.reduce((sum, team) => sum + team.calculateProgress(), 0) / teams.length 
        : 0,
      scoreDistribution: {
        excellent: teams.filter(t => t.totalScore >= 90).length,
        good: teams.filter(t => t.totalScore >= 70 && t.totalScore < 90).length,
        average: teams.filter(t => t.totalScore >= 50 && t.totalScore < 70).length,
        belowAverage: teams.filter(t => t.totalScore < 50).length
      },
      progressDistribution: {
        completed: teams.filter(t => t.calculateProgress() === 100).length,
        inProgress: teams.filter(t => t.calculateProgress() > 0 && t.calculateProgress() < 100).length,
        notStarted: teams.filter(t => t.calculateProgress() === 0).length
      },
      topPerformers: teams
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, 10)
        .map(team => ({
          teamId: team.teamId,
          teamName: team.teamName,
          category: team.category,
          totalScore: team.totalScore,
          progress: team.calculateProgress(),
          rank: team.rank.overall
        }))
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get real-time activity analytics
router.get('/activity/realtime', async (req, res) => {
  try {
    const teams = await Team.find({ isActive: true });
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const recentActivity = teams.filter(team => 
      team.lastActivity > oneHourAgo
    ).length;

    const analytics = {
      activeTeams: recentActivity,
      totalTeams: teams.length,
      activityPercentage: teams.length > 0 ? (recentActivity / teams.length) * 100 : 0,
      lastUpdated: now
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper functions
function getMostActiveCategory(teams) {
  const categoryCount = {};
  teams.forEach(team => {
    categoryCount[team.category] = (categoryCount[team.category] || 0) + 1;
  });
  
  return Object.keys(categoryCount).reduce((a, b) => 
    categoryCount[a] > categoryCount[b] ? a : b
  );
}

function getPeakActivityTime(teams) {
  // This would typically analyze contribution timestamps
  // For now, return a placeholder
  return '14:00-16:00';
}

module.exports = router; 