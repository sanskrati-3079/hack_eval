const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  startTime: String,
  endTime: String,
  isAvailable: {
    type: Boolean,
    default: true
  }
});

const mentorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  avatar: {
    type: String,
    default: ''
  },
  expertise: [{
    type: String,
    enum: ['AI/ML', 'Web Development', 'Mobile Development', 'Cybersecurity', 'IoT', 'Blockchain', 'UI/UX', 'DevOps', 'Database', 'Cloud Computing']
  }],
  availability: [availabilitySchema],
  currentTeams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  maxTeams: {
    type: Number,
    default: 5
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  bio: String,
  linkedin: String,
  github: String,
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Check if mentor is available at given time
mentorSchema.methods.isAvailableAt = function(day, time) {
  const daySchedule = this.availability.find(schedule => schedule.day === day);
  if (!daySchedule || !daySchedule.isAvailable) return false;
  
  const requestedTime = new Date(`2000-01-01 ${time}`);
  const startTime = new Date(`2000-01-01 ${daySchedule.startTime}`);
  const endTime = new Date(`2000-01-01 ${daySchedule.endTime}`);
  
  return requestedTime >= startTime && requestedTime <= endTime;
};

// Get current availability status
mentorSchema.methods.getCurrentStatus = function() {
  const now = new Date();
  const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
  const currentTime = now.toTimeString().slice(0, 5);
  
  return this.isAvailableAt(currentDay, currentTime);
};

module.exports = mongoose.model('Mentor', mentorSchema); 