import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaCode, FaBell, FaUser } from 'react-icons/fa';
import { TeamContext } from '../context/TeamContext';
import { API_BASE_URL } from '../config';
import './Header.css';

const Header = ({ onMenuClick }) => {
  const { team } = useContext(TeamContext);
  const [activeRound, setActiveRound] = useState(null);

  useEffect(() => {
    let mounted = true;
    let timerId;
    const fetchActive = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/round-state/active`);
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setActiveRound(data.round);
      } catch {}
    };
    fetchActive();
    timerId = setInterval(fetchActive, 5000);
    return () => { mounted = false; if (timerId) clearInterval(timerId); };
  }, []);

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <button className="menu-btn" onClick={onMenuClick} aria-label="Toggle navigation">
            <FaBars />
          </button>
          <Link to="/" className="logo">
            <FaCode className="logo-icon" />
            <h1>Hackathon Dashboard</h1>
          </Link>
        </div>

        <div className="header-center">
          {team && (
            <div className="team-info">
              <span className="team-name">{team.name}</span>
              <span className="team-id">({team.teamId})</span>
            </div>
          )}
        </div>

        <div className="header-right">
          <div className="current-round">
            <span className="round-label">Current Round:</span>
            <span className="round-name">{activeRound ? `Round ${activeRound}` : 'None'}</span>
          </div>
          
          <div className="header-actions">
            <Link to="/notifications" className="notification-btn">
              <FaBell />
              <span className="notification-badge">3</span>
            </Link>
            
            <div className="user-menu">
              <FaUser />
              <span>Team Lead</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 