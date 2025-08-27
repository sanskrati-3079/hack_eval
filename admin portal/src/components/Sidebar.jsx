import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Calculator, 
  Trophy, 
  UserCheck,
  FileSpreadsheet,
  X
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const menuItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      path: '/round-scheduler',
      name: 'Round Scheduler',
      icon: Calendar
    },
    {
      path: '/judge-assignment',
      name: 'Judge Assignment',
      icon: Users
    },
    {
      path: '/score-compiler',
      name: 'Score Compiler',
      icon: Calculator
    },
    {
      path: '/leaderboard',
      name: 'Leaderboard',
      icon: Trophy
    },
    {
      path: '/mentor-management',
      name: 'Mentor Management',
      icon: UserCheck
    },
    {
      path: '/excel-upload',
      name: 'Upload Teams',
      icon: FileSpreadsheet
    }
  ];

  return (
    <>
      {isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />
      )}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-logo">
              <div className="logo-circle">
                <span>GLA</span>
              </div>
            </div>
            <div className="brand-text">
              <h2>Hackathon</h2>
              <p>Admin Portal</p>
            </div>
          </div>
          <button 
            className="sidebar-close"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map((item) => (
              <li key={item.path} className="nav-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    `nav-link ${isActive ? 'nav-link-active' : ''}`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-info">
            <div className="admin-avatar">
              <span>AD</span>
            </div>
            <div className="admin-details">
              <p className="admin-name">Admin User</p>
              <p className="admin-role">System Administrator</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;