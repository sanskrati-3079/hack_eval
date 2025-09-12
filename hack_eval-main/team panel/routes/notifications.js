const express = require('express');
const router = express.Router();
const Team = require('../models/Team');

// Get notifications for a team
router.get('/team/:teamId', async (req, res) => {
  try {
    const team = await Team.findOne({ teamId: req.params.teamId });
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Generate notifications based on team status
    const notifications = generateTeamNotifications(team);
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all notifications (for admin dashboard)
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find({ isActive: true });
    const allNotifications = [];

    teams.forEach(team => {
      const teamNotifications = generateTeamNotifications(team);
      allNotifications.push(...teamNotifications);
    });

    // Sort by date (newest first)
    allNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(allNotifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark notification as read
router.put('/read/:teamId/:notificationId', async (req, res) => {
  try {
    // In a real application, you would store notifications in a separate collection
    // and mark them as read. For now, we'll just return success.
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Generate notifications for a team
function generateTeamNotifications(team) {
  const notifications = [];
  const now = new Date();

  // Submission notifications
  team.submissions.forEach(submission => {
    if (submission.status === 'uploaded') {
      notifications.push({
        id: `submission-${submission.round}-${team._id}`,
        type: 'success',
        title: 'Submission Confirmed',
        message: `Your ${submission.round} submission has been successfully uploaded and confirmed.`,
        timestamp: submission.submittedAt,
        teamId: team.teamId,
        category: 'submission'
      });
    } else if (submission.status === 'qualified') {
      notifications.push({
        id: `qualified-${submission.round}-${team._id}`,
        type: 'success',
        title: `Qualified for ${submission.round}`,
        message: `Congratulations! Your team has qualified for ${submission.round} of the hackathon.`,
        timestamp: submission.submittedAt,
        teamId: team.teamId,
        category: 'qualification'
      });
    } else if (submission.status === 'not-qualified') {
      notifications.push({
        id: `not-qualified-${submission.round}-${team._id}`,
        type: 'warning',
        title: `Not Qualified for ${submission.round}`,
        message: `Your team did not qualify for ${submission.round}. Please review the feedback and improve your submission.`,
        timestamp: submission.submittedAt,
        teamId: team.teamId,
        category: 'qualification'
      });
    }
  });

  // Deadline notifications
  const deadlines = {
    'IST': new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    'Round 1': new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    'Round 2': new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000) // 10 days from now
  };

  Object.entries(deadlines).forEach(([round, deadline]) => {
    const timeLeft = deadline.getTime() - now.getTime();
    const daysLeft = Math.ceil(timeLeft / (24 * 60 * 60 * 1000));

    if (daysLeft <= 1 && daysLeft > 0) {
      notifications.push({
        id: `deadline-${round}-${team._id}`,
        type: 'warning',
        title: 'Deadline Approaching',
        message: `${round} submission deadline is tomorrow. Please submit your work soon.`,
        timestamp: now,
        teamId: team.teamId,
        category: 'deadline'
      });
    } else if (daysLeft <= 3 && daysLeft > 0) {
      notifications.push({
        id: `deadline-${round}-${team._id}`,
        type: 'info',
        title: 'Deadline Reminder',
        message: `${round} submission deadline is in ${daysLeft} days.`,
        timestamp: now,
        teamId: team.teamId,
        category: 'deadline'
      });
    }
  });

  // Mentor notifications
  if (team.mentor) {
    notifications.push({
      id: `mentor-assigned-${team._id}`,
      type: 'info',
      title: 'Mentor Assigned',
      message: `A mentor has been assigned to your team. You can now schedule sessions for guidance.`,
      timestamp: team.updatedAt,
      teamId: team.teamId,
      category: 'mentor'
    });
  }

  // Progress notifications
  const progress = team.calculateProgress();
  if (progress >= 100) {
    notifications.push({
      id: `project-completed-${team._id}`,
      type: 'success',
      title: 'Project Completed',
      message: 'Congratulations! Your project has been completed successfully.',
      timestamp: now,
      teamId: team.teamId,
      category: 'progress'
    });
  } else if (progress >= 75) {
    notifications.push({
      id: `project-near-completion-${team._id}`,
      type: 'info',
      title: 'Project Near Completion',
      message: `Your project is ${progress}% complete. Keep up the great work!`,
      timestamp: now,
      teamId: team.teamId,
      category: 'progress'
    });
  }

  // Rank notifications
  if (team.rank.overall <= 5) {
    notifications.push({
      id: `top-rank-${team._id}`,
      type: 'success',
      title: 'Top Ranking',
      message: `Your team is currently ranked #${team.rank.overall} overall! Excellent performance!`,
      timestamp: now,
      teamId: team.teamId,
      category: 'ranking'
    });
  }

  if (team.rank.category <= 3) {
    notifications.push({
      id: `category-rank-${team._id}`,
      type: 'success',
      title: 'Category Leader',
      message: `Your team is ranked #${team.rank.category} in the ${team.category} category!`,
      timestamp: now,
      teamId: team.teamId,
      category: 'ranking'
    });
  }

  // Activity notifications
  const lastActivity = new Date(team.lastActivity);
  const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

  if (hoursSinceActivity > 24) {
    notifications.push({
      id: `inactivity-${team._id}`,
      type: 'warning',
      title: 'Inactivity Alert',
      message: 'Your team has been inactive for more than 24 hours. Consider updating your project progress.',
      timestamp: now,
      teamId: team.teamId,
      category: 'activity'
    });
  }

  // Sort notifications by timestamp (newest first)
  return notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

module.exports = router; 