import React, { useState } from 'react';
import { decodeJwt, verifyJwtWithJwks } from '../utils/crypto';
import { useTheme } from '../utils/ThemeContext';

type VerificationMode = 'jwksUrl' | 'jwksManual';

const JwkVerifier: React.FC = () => {
  const { darkMode } = useTheme();
  const [token, setToken] = useState('');
  const [mode, setMode] = useState<VerificationMode>('jwksUrl');
  const [jwksUrl, setJwksUrl] = useState('');
  const [manualJwks, setManualJwks] = useState('');
  const [expectedIssuer, setExpectedIssuer] = useState('');
  const [expectedAudience, setExpectedAudience] = useState('');
  const [expectedKeyId, setExpectedKeyId] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // Decode token to pre-populate fields
  const handleDecode = () => {
    if (!token.trim()) {
      setError('Please enter a JWT token');
      return;
    }

    try {
      const { header, payload, error } = decodeJwt(token);
      
      if (error) {
        setError(error);
        return;
      }

      // Auto-fill fields from token claims
      if (header?.kid && !expectedKeyId) {
        setExpectedKeyId(header.kid);
      }
      
      if (payload?.iss && !expectedIssuer) {
        setExpectedIssuer(payload.iss);
      }
      
      if (payload?.aud && !expectedAudience) {
        setExpectedAudience(Array.isArray(payload.aud) ? payload.aud[0] : payload.aud);
      }

      // Try to guess JWKS URL from issuer
      if (payload?.iss && !jwksUrl) {
        try {
          const issuerUrl = new URL(payload.iss);
          setJwksUrl(`${issuerUrl.origin}/.well-known/jwks.json`);
        } catch (e) {
          // If issuer is not a valid URL, don't set jwksUrl
        }
      }

      setError(undefined);
    } catch (e) {
      setError('Failed to decode token');
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setError(undefined);
    setVerificationResult(null);

    try {
      if (!token.trim()) {
        setError('Please enter a JWT token');
        return;
      }

      let jwks: Record<string, any> | undefined;
      
      if (mode === 'jwksManual') {
        if (!manualJwks.trim()) {
          setError('Please enter a JWKS');
          return;
        }
        
        try {
          const parsedJwks = JSON.parse(manualJwks);
          
          // Validate JWKS format
          if (!parsedJwks.keys || !Array.isArray(parsedJwks.keys) || parsedJwks.keys.length === 0) {
            setError('Invalid JWKS format. Must contain a "keys" array with at least one key.');
            return;
          }
          
          jwks = parsedJwks;
        } catch (e) {
          setError('Invalid JWKS format. Must be valid JSON.');
          return;
        }
      } else {
        if (!jwksUrl.trim()) {
          setError('Please enter a JWKS URL');
          return;
        }
      }

      const result = await verifyJwtWithJwks(token, {
        jwksUrl: mode === 'jwksUrl' ? jwksUrl : undefined,
        jwks: mode === 'jwksManual' ? jwks : undefined,
        expectedAudience: expectedAudience || undefined,
        expectedIssuer: expectedIssuer || undefined,
        expectedKeyId: expectedKeyId || undefined,
      });

      setVerificationResult(result);
    } catch (e) {
      setError('Verification failed with an unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setToken('');
    setJwksUrl('');
    setManualJwks('');
    setExpectedIssuer('');
    setExpectedAudience('');
    setExpectedKeyId('');
    setVerificationResult(null);
    setError(undefined);
  };

  return (
    <div className="container py-4 tool-container">
      <h1 className="mb-4">JWT Verifier</h1>
      <p className="text-muted mb-4">
        Verify JWT tokens against JWKS endpoints or a JWKS (JSON Web Key Set) to ensure they are valid and trusted.
      </p>

      <div className={`tool-section ${darkMode ? 'bg-dark' : 'bg-light'}`}>
        <div className="mb-3">
          <label htmlFor="token" className="form-label">JWT Token</label>
          <textarea
            id="token"
            className="form-control"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter JWT token to verify..."
          />
          <div className="mt-2">
            <button 
              className="btn btn-outline-secondary btn-sm"
              onClick={handleDecode}
            >
              Decode Token & Auto-Fill Fields
            </button>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label d-block">Verification Method</label>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="verificationMode"
              id="jwksUrlRadio"
              checked={mode === 'jwksUrl'}
              onChange={() => setMode('jwksUrl')}
            />
            <label className="form-check-label" htmlFor="jwksUrlRadio">
              JWKS URL Endpoint
            </label>
          </div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="verificationMode"
              id="jwksManualRadio"
              checked={mode === 'jwksManual'}
              onChange={() => setMode('jwksManual')}
            />
            <label className="form-check-label" htmlFor="jwksManualRadio">
              Manual JWKS Entry
            </label>
          </div>
        </div>

        {mode === 'jwksUrl' ? (
          <div className="mb-3">
            <label htmlFor="jwksUrl" className="form-label">JWKS URL</label>
            <input
              type="text"
              id="jwksUrl"
              className="form-control"
              value={jwksUrl}
              onChange={(e) => setJwksUrl(e.target.value)}
              placeholder="https://example.com/.well-known/jwks.json"
            />
            <small className="form-text text-muted">
              The URL to the JWKS (JSON Web Key Set) endpoint that contains the public keys.
            </small>
          </div>
        ) : (
          <div className="mb-3">
            <label htmlFor="manualJwks" className="form-label">JWKS (JSON Web Key Set)</label>
            <textarea
              id="manualJwks"
              className="form-control"
              value={manualJwks}
              onChange={(e) => setManualJwks(e.target.value)}
              placeholder='{"keys": [{"kty":"RSA","e":"AQAB","kid":"12345","n":"..."}]}'
            />
            <small className="form-text text-muted">
              Enter the JWKS with the "keys" array containing one or more JWK objects.
            </small>
          </div>
        )}

        <div className="mb-3">
          <label className="form-label">Verification Options</label>
          <div className="card mb-3">
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="expectedKeyId" className="form-label">Expected Key ID (kid)</label>
                <input
                  type="text"
                  id="expectedKeyId"
                  className="form-control"
                  value={expectedKeyId}
                  onChange={(e) => setExpectedKeyId(e.target.value)}
                  placeholder="Key ID from token header"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="expectedIssuer" className="form-label">Expected Issuer (iss)</label>
                <input
                  type="text"
                  id="expectedIssuer"
                  className="form-control"
                  value={expectedIssuer}
                  onChange={(e) => setExpectedIssuer(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="expectedAudience" className="form-label">Expected Audience (aud)</label>
                <input
                  type="text"
                  id="expectedAudience"
                  className="form-control"
                  value={expectedAudience}
                  onChange={(e) => setExpectedAudience(e.target.value)}
                  placeholder="my-api"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex gap-2 mb-3">
          <button 
            className="btn btn-primary"
            onClick={handleVerify}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify Token'}
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleClear}
            disabled={loading}
          >
            Clear
          </button>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {verificationResult && (
          <div className="mt-4">
            <h3>Verification Result</h3>
            <div className={`alert ${verificationResult.isValid ? 'alert-success' : 'alert-danger'}`}>
              <strong>{verificationResult.isValid ? 'Valid Token' : 'Invalid Token'}</strong>
              {verificationResult.error && (
                <div className="mt-2">{verificationResult.error}</div>
              )}
            </div>
            
            {verificationResult.validationDetails && (
              <div className="card mb-3">
                <div className="card-header">Validation Details</div>
                <ul className="list-group list-group-flush">
                  {Object.entries(verificationResult.validationDetails).map(([key, value]) => (
                    <li key={key} className="list-group-item d-flex justify-content-between align-items-center">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                      <span className={`badge ${value ? 'bg-success' : 'bg-danger'}`}>
                        {value ? 'Pass' : 'Fail'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {verificationResult.header && (
              <div className="mt-3">
                <h4>Header</h4>
                <div className={`${darkMode ? 'bg-black' : 'bg-dark'} text-white p-3 rounded`}>
                  <pre style={{ margin: 0 }}>
                    {JSON.stringify(verificationResult.header, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            
            {verificationResult.payload && (
              <div className="mt-3">
                <h4>Payload</h4>
                <div className={`${darkMode ? 'bg-black' : 'bg-dark'} text-white p-3 rounded`}>
                  <pre style={{ margin: 0 }}>
                    {JSON.stringify(verificationResult.payload, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JwkVerifier;