const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['Team Lead', 'Developer', 'Designer', 'Researcher', 'Documentation']
  },
  avatar: {
    type: String,
    default: ''
  },
  contributions: [{
    type: {
      type: String,
      enum: ['code', 'design', 'research', 'documentation', 'presentation']
    },
    description: String,
    hours: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  totalHours: {
    type: Number,
    default: 0
  },
  skills: [String],
  github: String,
  linkedin: String
});

const teamSchema = new mongoose.Schema({
  teamId: {
    type: String,
    required: true,
    unique: true
  },
  teamName: {
    type: String,
    required: true
  },
  problemStatement: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['AI/ML', 'Web Development', 'Mobile Development', 'Cybersecurity', 'IoT', 'Blockchain']
  },
  members: [memberSchema],
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentor'
  },
  submissions: [{
    round: {
      type: String,
      enum: ['IST', 'Round 1', 'Round 2']
    },
    files: [{
      filename: String,
      originalName: String,
      size: Number,
      uploadedAt: Date
    }],
    status: {
      type: String,
      enum: ['pending', 'uploaded', 'reviewed', 'qualified', 'not-qualified'],
      default: 'pending'
    },
    submittedAt: Date,
    feedback: String,
    score: Number
  }],
  totalScore: {
    type: Number,
    default: 0
  },
  rank: {
    overall: Number,
    category: Number
  },
  projectProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate total hours for team
teamSchema.methods.calculateTotalHours = function() {
  return this.members.reduce((total, member) => total + member.totalHours, 0);
};

// Calculate project progress
teamSchema.methods.calculateProgress = function() {
  const submissions = this.submissions.length;
  const maxSubmissions = 3; // IST, Round 1, Round 2
  return Math.round((submissions / maxSubmissions) * 100);
};

module.exports = mongoose.model('Team', teamSchema); 