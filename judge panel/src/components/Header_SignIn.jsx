import React from 'react';
import './Header.css'; // Create a separate CSS file for header styles
import logo from '../../public/images/gla.png'; // Adjust the path as necessary

const Header = ({ onMenuClick }) => {
    return (
        <header className="header">
            <div className="header-left">
                <img src='../../public/images/gla.png' alt="GLA University" className="header-logo" />
                <img src='../../public/images/DC.png' alt="Logo 2" className="dc-logo" />
            </div>
            <div className="header-right">
                <img src='../../public/images/sih.png' alt="Logo 1" className="header-right-logo" />
            </div>
        </header>
    );
};

export default Header;
