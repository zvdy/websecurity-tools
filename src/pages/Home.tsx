import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../utils/ThemeContext';

const Home: React.FC = () => {
  const { darkMode } = useTheme();
  const tools = [
    {
      id: 'jwt-decoder',
      title: 'JWT Decoder',
      description: 'Decode and inspect JSON Web Tokens (JWT) to view header and payload contents.',
      icon: '🔍',
      path: '/jwt-decoder'
    },
    {
      id: 'jwk-signer',
      title: 'JWK Signer',
      description: 'Create signed JWTs using a JSON Web Key (JWK) and custom payload.',
      icon: '✏️',
      path: '/jwk-signer'
    },
    {
      id: 'jwk-verifier',
      title: 'JWT Verifier',
      description: 'Verify JWT tokens against JWKS endpoints or JWK keys to ensure they are valid and trusted.',
      icon: '✅',
      path: '/jwk-verifier'
    },
    {
      id: 'base64',
      title: 'Base64 Encoder/Decoder',
      description: 'Encode data to Base64 or decode Base64 strings back to their original format.',
      icon: '🔄',
      path: '/base64'
    },
    {
      id: 'x509-decoder',
      title: 'X.509 Certificate Decoder',
      description: 'Decode X.509 certificates to view their details including subject, issuer, and validity period.',
      icon: '🔐',
      path: '/x509-decoder'
    }
  ];

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1>Security Tools Hub</h1>
        <p className="lead">A minimalistic collection of tools for security and API development</p>
      </div>

      <div className="row g-4">
        {tools.map(tool => (
          <div className="col-md-4" key={tool.id}>
            <div className={`card h-100 shadow tool-card ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}>
              <div className="card-body text-center">
                <div className="display-4 mb-3">{tool.icon}</div>
                <h2 className="card-title h5">{tool.title}</h2>
                <p className={`card-text ${darkMode ? 'text-light' : ''}`}>{tool.description}</p>
              </div>
              <div className="card-footer bg-transparent border-0 text-center pb-3">
                <Link to={tool.path} className="btn btn-primary">
                  Launch Tool
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;