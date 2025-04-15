import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import JwtDecoder from './pages/JwtDecoder';
import JwkSigner from './pages/JwkSigner';
import Base64 from './pages/Base64';

const App: React.FC = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jwt-decoder" element={<JwtDecoder />} />
          <Route path="/jwk-signer" element={<JwkSigner />} />
          <Route path="/base64" element={<Base64 />} />
        </Routes>
      </main>
      <footer className="bg-dark text-light py-3 text-center">
        <div className="container">
          <small>&copy; {new Date().getFullYear()} Security Tools Hub - Built with TypeScript and React</small>
        </div>
      </footer>
    </div>
  );
};

export default App;