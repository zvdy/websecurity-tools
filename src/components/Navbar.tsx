import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../utils/ThemeContext';

const Navbar: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <NavLink to="/" className="navbar-brand">Security Tools Hub</NavLink>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"} end>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/jwt-decoder" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                JWT Decoder
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/jwk-signer" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                JWK Signer
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/base64" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                Base64 Encoder/Decoder
              </NavLink>
            </li>
          </ul>
          <button 
            className="theme-toggle-btn" 
            onClick={toggleDarkMode}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;