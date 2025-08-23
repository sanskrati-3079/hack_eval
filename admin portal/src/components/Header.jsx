import React from 'react';
import { Menu, Bell, Search, User } from 'lucide-react';
import './Header.css';

const Header = ({ onMenuClick, onLogout }) => {
  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuClick}>
          <Menu size={24} />
        </button>
        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search..."
            className="search-input"
          />
        </div>
      </div>
      
      <div className="header-right">
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
    </header>
  );
};

export default Header; 