import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import JwtDecoder from './pages/JwtDecoder';
import JwkSigner from './pages/JwkSigner';
import Base64 from './pages/Base64';
import { ThemeProvider, useTheme } from './utils/ThemeContext';

// Footer component with theme awareness
const Footer: React.FC = () => {
  const { darkMode } = useTheme();
  return (
    <footer className={`${darkMode ? 'bg-dark' : 'bg-dark'} text-light py-3 text-center`}>
      <div className="container">
        <small>&copy; {new Date().getFullYear()} Security Tools Hub - Built with TypeScript and React</small>
      </div>
    </footer>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
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
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default App;