import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  ClipboardList, 
  Award,
  GraduationCap,
  UserPlus,
  X // Import close icon
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    {
      path: '/dashboard',
      icon: <Home size={20} />,
      label: 'Dashboard Home'
    },
    {
      path: '/evaluate',
      icon: <FileText size={20} />,
      label: 'Evaluate Submissions'
    },
    {
      path: '/assign',
      icon: <UserPlus size={20} />,
      label: 'Assign'
    },
    {
      path: '/my-evaluations',
      icon: <ClipboardList size={20} />,
      label: 'My Evaluations'
    },
    // {
    //   path: '/final-submissions',
    //   icon: <Award size={20} />,
    //   label: 'Final Submission List'
    // }
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <GraduationCap size={32} color="#1B4332" />
          <div className="logo-text">
            <h2>GLA University</h2>
            <p>Judge Portal</p>
          </div>
        </div>
        <button className="sidebar-close" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <div className="judge-info">
          <div className="judge-avatar">
            <GraduationCap size={24} />
          </div>
          <div className="judge-details">
            <p className="judge-name">Dr. John Smith</p>
            <p className="judge-role">Technical Judge</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;