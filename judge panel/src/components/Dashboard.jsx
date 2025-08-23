import React from 'react';
import { 
  FileText, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Award
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const stats = [
    {
      title: 'Total Submissions',
      value: '24',
      icon: <FileText size={24} />,
      color: 'blue',
      change: '+12% from yesterday'
    },
    {
      title: 'Evaluated',
      value: '18',
      icon: <CheckCircle size={24} />,
      color: 'green',
      change: '75% completion rate'
    },
    {
      title: 'Pending Review',
      value: '6',
      icon: <Clock size={24} />,
      color: 'orange',
      change: '25% remaining'
    },
    {
      title: 'Average Score',
      value: '7.8',
      icon: <TrendingUp size={24} />,
      color: 'purple',
      change: '+0.3 from last round'
    }
  ];

  const recentEvaluations = [
    {
      teamName: 'Team Innovators',
      projectName: 'Smart Waste Management',
      score: 8.5,
      status: 'Approved',
      date: '2 hours ago'
    },
    {
      teamName: 'CodeCrafters',
      projectName: 'AI-Powered Education Platform',
      score: 7.2,
      status: 'Needs Improvement',
      date: '4 hours ago'
    },
    {
      teamName: 'TechVision',
      projectName: 'Healthcare Monitoring System',
      score: 9.1,
      status: 'Approved',
      date: '6 hours ago'
    }
  ];

  const quickActions = [
    {
      title: 'Start New Evaluation',
      description: 'Begin evaluating the next submission',
      action: 'Evaluate',
      icon: <FileText size={20} />
    },
    {
      title: 'View Final Submissions',
      description: 'See all approved submissions',
      action: 'View',
      icon: <Award size={20} />
    },
    {
      title: 'My Evaluations',
      description: 'Review your completed evaluations',
      action: 'Review',
      icon: <CheckCircle size={20} />
    }
  ];

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back, Dr. Smith. Here's your evaluation overview.</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card stat-${stat.color}`}>
            <div className="stat-icon">
              {stat.icon}
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-title">{stat.title}</p>
              <p className="stat-change">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        {/* Recent Evaluations */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Evaluations</h2>
            <button className="btn btn-secondary">View All</button>
          </div>
          <div className="evaluations-list">
            {recentEvaluations.map((evaluation, index) => (
              <div key={index} className="evaluation-item">
                <div className="evaluation-info">
                  <h4>{evaluation.teamName}</h4>
                  <p>{evaluation.projectName}</p>
                  <span className="evaluation-date">{evaluation.date}</span>
                </div>
                <div className="evaluation-score">
                  <div className="score-badge">{evaluation.score}/10</div>
                  <div className={`status-badge status-${evaluation.status.toLowerCase().replace(' ', '-')}`}>
                    {evaluation.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="quick-actions">
            {quickActions.map((action, index) => (
              <div key={index} className="action-card">
                <div className="action-icon">
                  {action.icon}
                </div>
                <div className="action-content">
                  <h4>{action.title}</h4>
                  <p>{action.description}</p>
                  <button className="btn btn-primary">{action.action}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;



