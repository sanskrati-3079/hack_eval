import React from 'react';
import './Header.css'; // Create a separate CSS file for header styles
import logo from '../../public/images/gla.png'; // Adjust the path as necessary

const Header = ({ onMenuClick }) => {
    return (
        <header className="header">
            <div className="header-left">
                <img src='../../public/images/gla.png' alt="GLA University" className="header-logo" />
                <div className="menu-icon" onClick={onMenuClick}>
                    {/* Three horizontal lines for hamburger menu */}
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </div>
            </div>
            <div className="header-right">
                <img src='../../public/images/sih.png' alt="Logo 1" className="header-right-logo" />
                <img src='../../public/images/DC.png' alt="Logo 2" className="header-right-logo dc-logo" />
            </div>
        </header>
    );
};

export default Header;
