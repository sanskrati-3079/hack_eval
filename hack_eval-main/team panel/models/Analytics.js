const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  totalTeams: {
    type: Number,
    default: 0
  },
  totalParticipants: {
    type: Number,
    default: 0
  },
  submissionsByRound: {
    IST: {
      total: { type: Number, default: 0 },
      qualified: { type: Number, default: 0 },
      notQualified: { type: Number, default: 0 }
    },
    'Round 1': {
      total: { type: Number, default: 0 },
      qualified: { type: Number, default: 0 },
      notQualified: { type: Number, default: 0 }
    },
    'Round 2': {
      total: { type: Number, default: 0 },
      qualified: { type: Number, default: 0 },
      notQualified: { type: Number, default: 0 }
    }
  },
  submissionsByCategory: {
    'AI/ML': { type: Number, default: 0 },
    'Web Development': { type: Number, default: 0 },
    'Mobile Development': { type: Number, default: 0 },
    'Cybersecurity': { type: Number, default: 0 },
    'IoT': { type: Number, default: 0 },
    'Blockchain': { type: Number, default: 0 }
  },
  mentorStats: {
    totalMentors: { type: Number, default: 0 },
    activeMentors: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 }
  },
  projectProgress: {
    averageProgress: { type: Number, default: 0 },
    completedProjects: { type: Number, default: 0 },
    inProgressProjects: { type: Number, default: 0 }
  },
  activityMetrics: {
    totalContributions: { type: Number, default: 0 },
    averageHoursPerTeam: { type: Number, default: 0 },
    mostActiveCategory: { type: String, default: '' },
    peakActivityTime: { type: String, default: '' }
  }
}, {
  timestamps: true
});

// Get analytics for a specific date range
analyticsSchema.statics.getAnalyticsByDateRange = function(startDate, endDate) {
  return this.find({
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: 1 });
};

// Get latest analytics
analyticsSchema.statics.getLatestAnalytics = function() {
  return this.findOne().sort({ date: -1 });
};

module.exports = mongoose.model('Analytics', analyticsSchema); 