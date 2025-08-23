import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaUsers, 
  FaUpload, 
  FaTrophy, 
  FaUserTie, 
  FaChartBar, 
  FaBell,
  FaTimes
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: FaHome, label: 'Dashboard' },
    { path: '/team', icon: FaUsers, label: 'Team Info' },
    { path: '/submissions', icon: FaUpload, label: 'Submissions' },
    { path: '/leaderboard', icon: FaTrophy, label: 'Leaderboard' },
    { path: '/mentors', icon: FaUserTie, label: 'Mentors' },
    { path: '/analytics', icon: FaChartBar, label: 'Analytics' },
    { path: '/notifications', icon: FaBell, label: 'Notifications' },
  ];

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Navigation</h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="quick-stats">
            <div className="stat-item">
              <span className="stat-label">Current Round</span>
              <span className="stat-value">Round 1</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Days Left</span>
              <span className="stat-value">3</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar; 