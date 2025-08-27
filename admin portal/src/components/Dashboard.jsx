import React from 'react';
import { 
  Users, 
  Calendar, 
  Trophy, 
  UserCheck, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const stats = [
    {
      title: 'Total Teams',
      value: '24',
      change: '+3',
      changeType: 'positive',
      icon: Users,
      color: 'var(--primary-dark)'
    },
    {
      title: 'Active Rounds',
      value: '3',
      change: '1 live',
      changeType: 'info',
      icon: Calendar,
      color: 'var(--info)'
    },
    {
      title: 'Judges Assigned',
      value: '12',
      change: '+2',
      changeType: 'positive',
      icon: UserCheck,
      color: 'var(--success)'
    },
    {
      title: 'Average Score',
      value: '8.5',
      change: '+0.3',
      changeType: 'positive',
      icon: Trophy,
      color: 'var(--warning)'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'round',
      message: 'Round 2 submissions deadline extended by 2 hours',
      time: '2 hours ago',
      status: 'info'
    },
    {
      id: 2,
      type: 'judge',
      message: 'Dr. Sarah Johnson assigned to Team Alpha',
      time: '4 hours ago',
      status: 'success'
    },
    {
      id: 3,
      type: 'score',
      message: 'Team Beta received perfect score in Round 1',
      time: '6 hours ago',
      status: 'success'
    },
    {
      id: 4,
      type: 'mentor',
      message: 'Mentor availability updated for tomorrow',
      time: '1 day ago',
      status: 'info'
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Round 2 Judging',
      time: 'Today, 2:00 PM',
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'Final Presentations',
      time: 'Tomorrow, 10:00 AM',
      status: 'upcoming'
    },
    {
      id: 3,
      title: 'Award Ceremony',
      time: 'Day after tomorrow, 4:00 PM',
      status: 'upcoming'
    }
  ];

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back! Here's what's happening with your hackathon.</p>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-grid">
        {stats.map((stat, index) => (
          <div key={index} className="dashboard-card">
            <div className="card-header">
              <div className="card-icon" style={{ backgroundColor: stat.color + '20', color: stat.color }}>
                <stat.icon size={24} />
              </div>
              <h3>{stat.title}</h3>
            </div>
            <div className="card-value">
              <span className="value">{stat.value}</span>
              <span className={`change ${stat.changeType}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Recent Activities */}
        <div className="content-card">
          <div className="card-header">
            <h3>Recent Activities</h3>
          </div>
          <div className="card-body">
            <div className="activity-list">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    {activity.status === 'success' && <CheckCircle size={16} />}
                    {activity.status === 'info' && <AlertCircle size={16} />}
                  </div>
                  <div className="activity-content">
                    <p className="activity-message">{activity.message}</p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="content-card">
          <div className="card-header">
            <h3>Upcoming Events</h3>
          </div>
          <div className="card-body">
            <div className="event-list">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="event-item">
                  <div className="event-icon">
                    <Clock size={16} />
                  </div>
                  <div className="event-content">
                    <h4 className="event-title">{event.title}</h4>
                    <span className="event-time">{event.time}</span>
                  </div>
                  <div className="event-status">
                    <span className="status-indicator status-upcoming">Upcoming</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions
      <div className="quick-actions">
        <div className="card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="card-body">
            <div className="action-grid">
              <button className="btn btn-primary">
                <Calendar size={16} />
                Schedule New Round
              </button>
              <button className="btn btn-secondary">
                <Users size={16} />
                Assign Judges
              </button>
              <button className="btn btn-secondary">
                <Trophy size={16} />
                View Leaderboard
              </button>
              <button className="btn btn-secondary">
                <UserCheck size={16} />
                Manage Mentors
              </button>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Dashboard; 