import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaUpload, 
  FaTrophy, 
  FaChartBar, 
  FaSignOutAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import './Header.css';
import { logout } from '../api/teams.jsx';

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const menuItems = [
    { path: '/', icon: FaHome, label: 'Dashboard' },
    { path: '/submissions', icon: FaUpload, label: 'Submissions' },
    { path: '/leaderboard', icon: FaTrophy, label: 'Leaderboard' },
    { path: '/program-schedule', icon: FaChartBar, label: 'Schedule' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
  if (window.confirm('Are you sure you want to logout?')) {
    logout();
  }
};

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Brand/Logo Section */}
          <div className="navbar-brand">
            {/* <div className="brand-logo">
              <img src='../../public/images/DC.png' alt="DC Logo" className="brand-image" />
            </div> */}
            <div className="brand-text">
              <span className="brand-title">Team Dashboard</span>
              {/* <span className="brand-subtitle">Team Dashboard</span> */}
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="navbar-nav desktop-nav">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  <Icon className="nav-icon" />
                  <span className="nav-text">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="navbar-right">
            <button 
              onClick={handleLogout}
              className="logout-btn desktop-logout"
            >
              <FaSignOutAlt className="logout-icon" />
              <span className="logout-text">Logout</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              className="mobile-menu-toggle"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-nav-content">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <Icon className="mobile-nav-icon" />
                  <span className="mobile-nav-text">{item.label}</span>
                </Link>
              );
            })}
            
            <button 
              onClick={handleLogout}
              className="mobile-logout-btn"
            >
              <FaSignOutAlt className="mobile-logout-icon" />
              <span className="mobile-logout-text">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={closeMobileMenu}></div>
      )}
    </>
  );
};

export default Navbar;