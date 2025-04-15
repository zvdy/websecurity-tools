import React, { useState, useEffect } from 'react';
import { decodeJwt } from '../utils/crypto';
import { useTheme } from '../utils/ThemeContext';

const JwtDecoder: React.FC = () => {
  const [jwtToken, setJwtToken] = useState('');
  const [decodedHeader, setDecodedHeader] = useState<any>(null);
  const [decodedPayload, setDecodedPayload] = useState<any>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const [privateKey, setPrivateKey] = useState<string>('');
  const [publicKey, setPublicKey] = useState<string>('');
  const { darkMode } = useTheme();

  // Auto-decode when token changes
  useEffect(() => {
    if (jwtToken.trim()) {
      handleDecode();
    } else {
      setDecodedHeader(null);
      setDecodedPayload(null);
      setError(undefined);
    }
  }, [jwtToken]);

  const handleDecode = () => {
    if (!jwtToken.trim()) {
      setError('Please enter a JWT token');
      setDecodedHeader(null);
      setDecodedPayload(null);
      return;
    }

    try {
      const { header, payload, error } = decodeJwt(jwtToken);
      setDecodedHeader(header);
      setDecodedPayload(payload);
      setError(error);
    } catch (err) {
      setError('Invalid JWT format');
      setDecodedHeader(null);
      setDecodedPayload(null);
    }
  };

  const handleClear = () => {
    setJwtToken('');
    setDecodedHeader(null);
    setDecodedPayload(null);
    setError(undefined);
    setPrivateKey('');
    setPublicKey('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Highlight token parts with different colors
  const renderColoredToken = () => {
    if (!jwtToken) return null;
    
    const parts = jwtToken.split('.');
    if (parts.length !== 3) {
      return <span className="text-danger">{jwtToken}</span>;
    }

    return (
      <div className="token-parts">
        <span className="text-primary">{parts[0]}</span>
        <span>.</span>
        <span className="text-danger">{parts[1]}</span>
        <span>.</span>
        <span className="text-info">{parts[2]}</span>
      </div>
    );
  };

  // Extract token byte length
  const getTokenByteLength = () => {
    return jwtToken ? new TextEncoder().encode(jwtToken).length : 0;
  };

  // Extract header byte length
  const getHeaderByteLength = () => {
    return decodedHeader ? new TextEncoder().encode(JSON.stringify(decodedHeader)).length : 0;
  };

  return (
    <div className="container-fluid py-4">
      <h1 className="mb-4">JWT Decoder</h1>
      <p className="text-muted mb-4">
        Decode and inspect JWT tokens to view their header and payload contents.
      </p>

      <div className="row">
        {/* Left column - Encoded token */}
        <div className="col-md-6">
          <div className={`card mb-4 ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}>
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>Encoded Token <small>({getTokenByteLength()} bytes)</small></span>
              <div>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setJwtToken('')} title="Clear">
                  <i className="bi bi-trash"></i>
                </button>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => copyToClipboard(jwtToken)} title="Copy">
                  <i className="bi bi-clipboard"></i>
                </button>
              </div>
            </div>
            <div className="card-body">
              <textarea
                className={`form-control ${darkMode ? 'bg-black text-white border-dark' : ''}`}
                value={jwtToken}
                onChange={(e) => setJwtToken(e.target.value)}
                placeholder="Enter JWT token here..."
                rows={10}
                style={{ fontFamily: 'monospace', overflowWrap: 'break-word' }}
              />
              {renderColoredToken()}
            </div>
          </div>

          {/* Token verification options */}
          <div className={`card mb-4 ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}>
            <div className="card-header">Verification Options</div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Algorithm</label>
                <input 
                  type="text"
                  className={`form-control ${darkMode ? 'bg-black text-white border-dark' : ''}`}
                  value={decodedHeader?.alg || ''}
                  readOnly
                  placeholder="Auto-detected"
                />
              </div>

              <div className="d-flex justify-content-center">
                <button className="btn btn-outline-primary">
                  <i className="bi bi-arrow-left-right"></i>
                </button>
              </div>

              <div className="mb-3">
                <label className="form-label">
                  <i className="bi bi-check-circle-fill text-success me-1"></i>
                  Signature
                </label>
                <button 
                  className="btn btn-primary w-100"
                  onClick={handleDecode}
                >
                  Verify Signature
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Decoded data */}
        <div className="col-md-6">
          {/* Decoded Header */}
          <div className={`card mb-4 ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}>
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>Decoded Header <small>({getHeaderByteLength()} bytes)</small></span>
              <div>
                <button className="btn btn-sm btn-outline-secondary me-1" title="Refresh">
                  <i className="bi bi-arrow-repeat"></i>
                </button>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => decodedHeader && copyToClipboard(JSON.stringify(decodedHeader, null, 2))} title="Copy">
                  <i className="bi bi-clipboard"></i>
                </button>
              </div>
            </div>
            <div className="card-body">
              {error ? (
                <div className="alert alert-danger">
                  {error}
                </div>
              ) : decodedHeader ? (
                <div className={`${darkMode ? 'bg-black' : 'bg-dark'} text-white p-3 rounded`}>
                  <pre style={{ margin: 0, overflow: 'auto' }}>
                    {JSON.stringify(decodedHeader, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-muted">No header data</div>
              )}
            </div>
          </div>

          {/* Decoded Payload */}
          <div className={`card mb-4 ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}>
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>Decoded Payload</span>
              <div>
                <button className="btn btn-sm btn-outline-secondary me-1" title="Refresh">
                  <i className="bi bi-arrow-repeat"></i>
                </button>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => decodedPayload && copyToClipboard(JSON.stringify(decodedPayload, null, 2))} title="Copy">
                  <i className="bi bi-clipboard"></i>
                </button>
              </div>
            </div>
            <div className="card-body">
              {decodedPayload ? (
                <div className={`${darkMode ? 'bg-black' : 'bg-dark'} text-white p-3 rounded`}>
                  <pre style={{ margin: 0, overflow: 'auto' }}>
                    {JSON.stringify(decodedPayload, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-muted">No payload data</div>
              )}
            </div>
          </div>

          {/* Private Key */}
          <div className={`card mb-4 ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}>
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>Private Key</span>
              <div>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setPrivateKey('')} title="Clear">
                  <i className="bi bi-arrow-repeat"></i>
                </button>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => copyToClipboard(privateKey)} title="Copy">
                  <i className="bi bi-clipboard"></i>
                </button>
              </div>
            </div>
            <div className="card-body">
              <textarea
                className={`form-control ${darkMode ? 'bg-black text-white border-dark' : ''}`}
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="Enter private key here..."
                rows={4}
                style={{ fontFamily: 'monospace' }}
              />
            </div>
          </div>

          {/* Public Key */}
          <div className={`card ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}>
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>Public Key (PEM or JWKS)</span>
              <div>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => copyToClipboard(publicKey)} title="Copy">
                  <i className="bi bi-clipboard"></i>
                </button>
              </div>
            </div>
            <div className="card-body">
              <textarea
                className={`form-control ${darkMode ? 'bg-black text-white border-dark' : ''}`}
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                placeholder="Enter public key here..."
                rows={4}
                style={{ fontFamily: 'monospace' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="d-flex justify-content-center mt-4">
        <button 
          className="btn btn-primary me-2"
          onClick={handleDecode}
        >
          Decode
        </button>
        <button 
          className="btn btn-secondary"
          onClick={handleClear}
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

export default JwtDecoder;