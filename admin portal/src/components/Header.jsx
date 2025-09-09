import React, { useState } from 'react';
import { 
  Menu, 
  Bell, 
  User, 
  Home, 
  Calendar, 
  Users, 
  ClipboardList, 
  BarChart2, 
  UserCheck, 
  Upload, 
  FileText,
  ChevronDown 
} from 'lucide-react';
import './Header.css';

const Header = ({ onMenuClick, onLogout, activeRound }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const navigationItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/round-scheduler', icon: Calendar, label: 'Round Scheduler' },
    { path: '/judge-assignment', icon: UserCheck, label: 'Judge Assignment' },
    { path: '/score-compiler', icon: ClipboardList, label: 'Score Compiler' },
    { path: '/leaderboard', icon: BarChart2, label: 'Leaderboard' },
    { path: '/mentor-management', icon: Users, label: 'Mentor Management' },
    { path: '/excel-upload', icon: Upload, label: 'Excel Upload' },
    { path: '/final-submissions', icon: FileText, label: 'Final Submissions' }
  ];

  return (
    <header className="header">
      {/* Top Header Row */}
      <div className="header-top">
        <div className="header-left">
          <div className="brand-text">
            <div className="brand-logo">
              {/* Fixed image path - moved from public folder path to relative path */}
              <img 
                src="/images/codoraai.png" 
                alt="CodoraAI Logo" 
                onError={(e) => {
                  // Fallback to logo circle if image fails to load
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              {/* Fallback logo circle - hidden by default, shown if image fails */}
              <div className="logo-circle" style={{display: 'none'}}>
                CA
              </div>
            </div>
            <div className="brand-info">
              <span className="brand-title"><b>Admin Dashboard</b></span>
            </div>
          </div>
        </div>
        
        <div className="header-right">
          <div className="round-indicator">
            <span className="round-label">Current Round:</span>
            <span className="round-value">
              {activeRound ? `Round ${activeRound}` : 'None'}
            </span>
          </div>
          
          <button className="notification-btn">
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </button>
          
          <div className="user-menu">
            <button className="user-btn" onClick={onLogout} title="Log out">
              <User size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Row */}
      <nav className={`header-nav ${isNavOpen ? 'nav-open' : ''}`}>
        <div className="nav-container">
          <ul className="nav-list">
            {navigationItems.map(({ path, icon: Icon, label }) => (
              <li key={path} className="nav-item">
                {/* You'll need to replace this with your router's Link component */}
                <a 
                  href={path} 
                  className="nav-link"
                  onClick={() => setIsNavOpen(false)}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {isNavOpen && (
        <div 
          className="nav-overlay" 
          onClick={() => setIsNavOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;