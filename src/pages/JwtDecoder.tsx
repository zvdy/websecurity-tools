import React, { useState } from 'react';
import { decodeJwt } from '../utils/crypto';
import { useTheme } from '../utils/ThemeContext';

const JwtDecoder: React.FC = () => {
  const [jwtToken, setJwtToken] = useState('');
  const [decodedHeader, setDecodedHeader] = useState<any>(null);
  const [decodedPayload, setDecodedPayload] = useState<any>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const { darkMode } = useTheme();

  const handleDecode = () => {
    if (!jwtToken.trim()) {
      setError('Please enter a JWT token');
      setDecodedHeader(null);
      setDecodedPayload(null);
      return;
    }

    const { header, payload, error } = decodeJwt(jwtToken);
    setDecodedHeader(header);
    setDecodedPayload(payload);
    setError(error);
  };

  const handleClear = () => {
    setJwtToken('');
    setDecodedHeader(null);
    setDecodedPayload(null);
    setError(undefined);
  };

  return (
    <div className="container py-4 tool-container">
      <h1 className="mb-4">JWT Decoder</h1>
      <p className="text-muted mb-4">
        Decode and inspect JWT tokens to view their header and payload contents.
      </p>

      <div className={`tool-section ${darkMode ? 'bg-dark' : 'bg-light'}`}>
        <div className="mb-3">
          <label htmlFor="jwtToken" className="form-label">JWT Token</label>
          <textarea
            id="jwtToken"
            className="form-control"
            value={jwtToken}
            onChange={(e) => setJwtToken(e.target.value)}
            placeholder="Enter JWT token here..."
          />
        </div>
        
        <div className="d-flex gap-2 mb-3">
          <button 
            className="btn btn-primary"
            onClick={handleDecode}
          >
            Decode
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleClear}
          >
            Clear
          </button>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {decodedHeader && (
          <div className="mt-4">
            <h3>Header</h3>
            <div className={`${darkMode ? 'bg-black' : 'bg-dark'} text-white p-3 rounded`}>
              <pre style={{ margin: 0 }}>
                {JSON.stringify(decodedHeader, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {decodedPayload && (
          <div className="mt-4">
            <h3>Payload</h3>
            <div className={`${darkMode ? 'bg-black' : 'bg-dark'} text-white p-3 rounded`}>
              <pre style={{ margin: 0 }}>
                {JSON.stringify(decodedPayload, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JwtDecoder;