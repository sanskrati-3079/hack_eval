import React from 'react';
import './Header.css'; // Create a separate CSS file for header styles
import logo from '../../public/images/gla.png'; // Adjust the path as necessary
import { logout } from '../utils/api.js';

const Header = ({ onMenuClick }) => {
    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
        }
    };

    return (
        <header className="header">
            <div className="header-left">
                <div className="menu-icon" onClick={onMenuClick}>
                    {/* Three horizontal lines for hamburger menu */}
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </div>
            </div>
            <div className="header-right">
                <button 
                    onClick={handleLogout}
                    className="logout-btn"
                    style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginLeft: '15px',
                        fontSize: '14px'
                    }}
                >
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;
