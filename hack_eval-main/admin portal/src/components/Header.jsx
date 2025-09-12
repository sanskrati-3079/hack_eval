import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import './Header.css';

const Header = ({ onMenuClick, onLogout, activeRound }) => {
  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuClick}>
          <Menu size={24} />
        </button>
        <img
          src="/images/gla.png"
          alt="GLA University"
          className="header-logo-left"
        />
        <img
          src="..\\..\\public\\images\\DC.png"
          alt="GLA University"
          className="header-logo-left-2"
        />
      </div>
      
      <div className="header-right">
        <div style={{ color: '#e5e7eb', fontWeight: 600, marginRight: 12 }}>
          Current Round:
        </div>
        <div style={{ color: '#ffffff', fontWeight: 700, marginRight: 16 }}>
          {activeRound ? `Round ${activeRound}` : 'None'}
        </div>
        <button className="notification-btn">
          <Bell size={25} />
          <span className="notification-badge">3</span>
        </button>
        
        <div className="user-menu">
          <button className="user-btn" onClick={onLogout} title="Log out">
            <User size={28} />
            <span>Logout</span>
          </button>
        </div>

        <img
          src="/images/sih.png"
          alt="Smart India Hackathon 2022"
          className="header-logo-right"
        />
      </div>
    </header>
  );
};

export default Header; 