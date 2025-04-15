import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar: React.FC = () => {
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
          <ul className="navbar-nav">
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;