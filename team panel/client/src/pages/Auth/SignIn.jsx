import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { TeamContext } from '../../context/TeamContext';
import toast from 'react-hot-toast';
import './Auth.css';

const SignIn = () => {
  const navigate = useNavigate();
  const { setTeam } = useContext(TeamContext);
  const [formData, setFormData] = useState({
    teamId: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Simulated authentication
    if (formData.teamId === 'TC-2024-001' && formData.password === 'hackathon') {
      const sampleTeamData = {
        id: 'TC-2024-001',
        teamId: 'TC-2024-001',
        name: 'Team Innovators',
        members: [
          { id: 1, name: 'John Doe', role: 'Team Lead' },
          { id: 2, name: 'Jane Smith', role: 'Developer' },
          { id: 3, name: 'Mike Johnson', role: 'Designer' },
          { id: 4, name: 'Sarah Wilson', role: 'Developer' }
        ],
        track: 'Web Development',
        project: {
          name: 'Smart Dashboard',
          description: 'A comprehensive team management dashboard for hackathons.',
          status: 'In Progress',
          githubUrl: 'https://github.com/team-innovators/smart-dashboard'
        },
        submissions: [
          { id: 1, title: 'Project Proposal', status: 'Approved', submittedAt: '2024-02-15T10:00:00Z', feedback: 'Excellent proposal!' },
          { id: 2, title: 'MVP Demo', status: 'Pending', submittedAt: '2024-02-18T15:30:00Z', feedback: null },
          { id: 3, title: 'Final Presentation', status: 'Scheduled', submittedAt: null, feedback: null }
        ],
        mentorSessions: [
          {
            id: 1,
            mentorName: 'Dr. Sarah Wilson',
            topic: 'Architecture Review',
            scheduledFor: '2024-02-20T14:00:00Z',
            status: 'Scheduled'
          },
          {
            id: 2,
            mentorName: 'Prof. James Brown',
            topic: 'Technical Implementation',
            scheduledFor: '2024-02-22T11:00:00Z',
            status: 'Pending'
          }
        ],
        currentRank: 5,
        score: 85,
        status: 'Active',
        analytics: {
          commitCount: 156,
          codeReviews: 24,
          testsWritten: 89,
          bugsFixed: 15,
          velocity: 85,
          codeQuality: 95,
          collaborationScore: 4.8,
          onTimeDelivery: 92
        }
      };
      
      // Store team data in localStorage
      localStorage.setItem('team', JSON.stringify(sampleTeamData));
      setTeam(sampleTeamData);
      toast.success('Signed in successfully');
      navigate('/');
    } else {
      setError('Invalid team ID or password');
      toast.error('Invalid credentials');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Team Sign In</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-group">
              <label>Team ID</label>
              <input
                type="text"
                name="teamId"
                value={formData.teamId}
                onChange={handleChange}
                placeholder="Enter your team ID"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>
          </div>
          
          <button type="submit" className="auth-button">Sign In</button>
          
          <div className="demo-credentials">
            <h3>Demo Credentials</h3>
            <p><strong>Team ID:</strong> TC-2024-001</p>
            <p><strong>Password:</strong> hackathon</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;