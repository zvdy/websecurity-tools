import React, { useState } from 'react';
import { decodeX509Certificate } from '../utils/crypto';
import { useTheme } from '../utils/ThemeContext';

const X509Decoder: React.FC = () => {
  const { darkMode } = useTheme();
  const [certificate, setCertificate] = useState('');
  const [decodedCertificate, setDecodedCertificate] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handleDecode = async () => {
    if (!certificate.trim()) {
      setError('Please enter an X.509 certificate');
      setDecodedCertificate(null);
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      // Parse the certificate using our updated decoder
      const { decoded, error } = await decodeX509Certificate(certificate);
      
      if (error) {
        setError(error);
        setDecodedCertificate(null);
      } else {
        setDecodedCertificate(decoded);
        setError(undefined);
      }
    } catch (e) {
      setError('Failed to decode certificate: ' + (e instanceof Error ? e.message : String(e)));
      setDecodedCertificate(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setCertificate('');
    setDecodedCertificate(null);
    setError(undefined);
  };

  // Direct parsing of the certificate data
  const parseCertificateDirectly = () => {
    try {
      // Simple manual parsing to display basic details
      if (!certificate) return null;
      
      // Check if it's a PEM certificate
      if (certificate.includes('-----BEGIN CERTIFICATE-----')) {
        // Extract certificate data between BEGIN and END markers
        const certData = certificate
          .replace(/-----BEGIN CERTIFICATE-----/, '')
          .replace(/-----END CERTIFICATE-----/, '')
          .replace(/\s+/g, '');
        
        // Display basic certificate info with all required properties
        return {
          format: "PEM",
          encodedLength: certData.length,
          valid: true,
          subject: "Not available in basic view",
          issuer: "Not available in basic view",
          serialNumber: "Not available in basic view",
          version: "Not available in basic view",
          validFrom: "Not available in basic view",
          validTo: "Not available in basic view",
          thumbprint: null,
          extensions: [], // Add empty extensions array
          publicKeyInfo: {
            algorithm: "Not available in basic view"
          }
        };
      } else {
        // Assume it's DER encoded (base64)
        return {
          format: "DER (Base64)",
          encodedLength: certificate.length,
          valid: true,
          subject: "Not available in basic view",
          issuer: "Not available in basic view",
          serialNumber: "Not available in basic view",
          version: "Not available in basic view",
          validFrom: "Not available in basic view",
          validTo: "Not available in basic view",
          thumbprint: null,
          extensions: [], // Add empty extensions array
          publicKeyInfo: {
            algorithm: "Not available in basic view"
          }
        };
      }
    } catch (e) {
      console.error("Error in direct parsing:", e);
      return null;
    }
  };

  // Get fallback data if main decoder fails
  const fallbackData = decodedCertificate || parseCertificateDirectly();

  return (
    <div className="container py-4 tool-container">
      <h1 className="mb-4">X.509 Certificate Decoder</h1>
      <p className="text-muted mb-4">
        Decode X.509 certificates to view their details including subject, issuer, validity period, and extensions.
      </p>

      <div className={`tool-section ${darkMode ? 'bg-dark' : 'bg-light'}`}>
        <div className="mb-3">
          <label htmlFor="certificate" className="form-label">Certificate (PEM or DER format)</label>
          <textarea
            id="certificate"
            className="form-control"
            value={certificate}
            onChange={(e) => setCertificate(e.target.value)}
            placeholder="Paste your X.509 certificate here..."
            rows={10}
          />
          <small className="form-text text-muted">
            Accept both PEM format (-----BEGIN CERTIFICATE-----) and DER format (base64 encoded).
          </small>
        </div>
        
        <div className="d-flex gap-2 mb-3">
          <button 
            className="btn btn-primary"
            onClick={handleDecode}
            disabled={loading}
          >
            {loading ? 'Decoding...' : 'Decode Certificate'}
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

        {fallbackData && (
          <div className="mt-4">
            <h3>Certificate Details</h3>
            
            <div className="card mb-3">
              <div className="card-header">Basic Information</div>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  <strong>Format:</strong> {fallbackData.format || "X.509"}
                </li>
                <li className="list-group-item">
                  <strong>Subject:</strong> {fallbackData.subject || "Not available"}
                </li>
                <li className="list-group-item">
                  <strong>Issuer:</strong> {fallbackData.issuer || "Not available"}
                </li>
                <li className="list-group-item">
                  <strong>Serial Number:</strong> {fallbackData.serialNumber || "Not available"}
                </li>
                <li className="list-group-item">
                  <strong>Version:</strong> {fallbackData.version || "Not available"}
                </li>
                <li className="list-group-item">
                  <strong>Valid From:</strong> {fallbackData.validFrom || "Not available"}
                </li>
                <li className="list-group-item">
                  <strong>Valid To:</strong> {fallbackData.validTo || "Not available"}
                </li>
                {fallbackData.thumbprint && (
                  <li className="list-group-item">
                    <strong>Thumbprint/Fingerprint:</strong> {fallbackData.thumbprint}
                  </li>
                )}
              </ul>
            </div>
            
            {fallbackData.extensions && fallbackData.extensions.length > 0 && (
              <div className="card mb-3">
                <div className="card-header">Extensions</div>
                <ul className="list-group list-group-flush">
                  {fallbackData.extensions.map((ext: any, index: number) => (
                    <li key={index} className="list-group-item">
                      <strong>{ext.name || 'Extension'}:</strong> {ext.value || 'N/A'}
                      {ext.critical && <span className="badge bg-warning ms-2">Critical</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {fallbackData.publicKeyInfo && (
              <div className="card mb-3">
                <div className="card-header">Public Key Information</div>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item">
                    <strong>Algorithm:</strong> {fallbackData.publicKeyInfo.algorithm || "Not available"}
                  </li>
                  {fallbackData.publicKeyInfo.keySize && (
                    <li className="list-group-item">
                      <strong>Key Size:</strong> {fallbackData.publicKeyInfo.keySize} bits
                    </li>
                  )}
                </ul>
              </div>
            )}
            
            <div className="mt-3">
              <h4>Raw Certificate Data</h4>
              <div className={`${darkMode ? 'bg-black' : 'bg-dark'} text-white p-3 rounded`}>
                <pre style={{ margin: 0, overflow: 'auto', maxHeight: '300px' }}>
                  {JSON.stringify(fallbackData, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default X509Decoder;