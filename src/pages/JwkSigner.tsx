import React, { useState } from 'react';
import { signWithJwk } from '../utils/crypto';

const JwkSigner: React.FC = () => {
  const [jwk, setJwk] = useState('');
  const [payload, setPayload] = useState('');
  const [algorithm, setAlgorithm] = useState('RS256');
  const [expiresIn, setExpiresIn] = useState('1h');
  const [signedToken, setSignedToken] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const algorithms = ['RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512', 'HS256', 'HS384', 'HS512'];
  
  const handleSign = async () => {
    try {
      setIsLoading(true);
      setError(undefined);
      
      if (!jwk.trim()) {
        setError('Please enter a JWK');
        return;
      }
      
      if (!payload.trim()) {
        setError('Please enter a payload');
        return;
      }
      
      let parsedJwk;
      let parsedPayload;
      
      try {
        parsedJwk = JSON.parse(jwk);
      } catch (e) {
        setError('Invalid JWK format. Must be valid JSON.');
        return;
      }
      
      try {
        parsedPayload = JSON.parse(payload);
      } catch (e) {
        setError('Invalid payload format. Must be valid JSON.');
        return;
      }
      
      const result = await signWithJwk(
        parsedPayload,
        parsedJwk,
        { algorithm, expiresIn }
      );
      
      if (result.error) {
        setError(result.error);
        setSignedToken('');
      } else {
        setSignedToken(result.token);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setSignedToken('');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClear = () => {
    setJwk('');
    setPayload('');
    setAlgorithm('RS256');
    setExpiresIn('1h');
    setSignedToken('');
    setError(undefined);
  };

  return (
    <div className="container py-4 tool-container">
      <h1 className="mb-4">JWK Signer</h1>
      <p className="text-muted mb-4">
        Create signed JWTs using a JSON Web Key (JWK) and custom payload.
      </p>

      <div className="tool-section bg-light">
        <div className="mb-3">
          <label htmlFor="jwk" className="form-label">JWK (JSON Web Key)</label>
          <textarea
            id="jwk"
            className="form-control"
            value={jwk}
            onChange={(e) => setJwk(e.target.value)}
            placeholder="Enter JWK here..."
          />
        </div>

        <div className="mb-3">
          <label htmlFor="payload" className="form-label">Payload</label>
          <textarea
            id="payload"
            className="form-control"
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            placeholder='{"sub": "1234567890", "name": "John Doe", "iat": 1516239022}'
          />
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="algorithm" className="form-label">Algorithm</label>
            <select
              id="algorithm"
              className="form-select"
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
            >
              {algorithms.map(algo => (
                <option key={algo} value={algo}>{algo}</option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label htmlFor="expiresIn" className="form-label">Expires In</label>
            <select
              id="expiresIn"
              className="form-select"
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
            >
              <option value="300">5 minutes</option>
              <option value="900">15 minutes</option>
              <option value="1800">30 minutes</option>
              <option value="3600">1 hour</option>
              <option value="86400">1 day</option>
              <option value="604800">1 week</option>
              <option value="2592000">30 days</option>
            </select>
          </div>
        </div>

        <div className="d-flex gap-2 mb-3">
          <button 
            className="btn btn-primary"
            onClick={handleSign}
            disabled={isLoading}
          >
            {isLoading ? 'Signing...' : 'Sign JWT'}
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleClear}
            disabled={isLoading}
          >
            Clear
          </button>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {signedToken && (
          <div className="mt-4">
            <h3>Signed JWT</h3>
            <div className="bg-dark text-white p-3 rounded">
              <pre className="text-break" style={{ margin: 0 }}>
                {signedToken}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JwkSigner;