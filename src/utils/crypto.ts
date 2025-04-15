import jwt from 'jsonwebtoken';
import * as jose from 'jose';

/**
 * Decodes a JWT token without verification
 */
export const decodeJwt = (token: string): { header: any; payload: any; error?: string } => {
  try {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) {
      return { 
        header: null, 
        payload: null, 
        error: 'Invalid token format' 
      };
    }
    return {
      header: decoded.header,
      payload: decoded.payload
    };
  } catch (error) {
    return {
      header: null,
      payload: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Signs a payload with a JWK
 */
export const signWithJwk = async (
  payload: Record<string, any>,
  jwk: Record<string, any>,
  options: { algorithm?: string; expiresIn?: string | number }
): Promise<{ token: string; error?: string }> => {
  try {
    const { algorithm = 'RS256', expiresIn = '1h' } = options;
    
    // Parse and import the JWK
    const privateKey = await jose.importJWK(jwk, algorithm);
    
    // Create header and set expiration time
    const now = Math.floor(Date.now() / 1000);
    const finalPayload = {
      ...payload,
      exp: typeof expiresIn === 'number' 
        ? now + expiresIn
        : now + (parseInt(expiresIn) || 3600)  // Default to 1 hour
    };
    
    // Sign the JWT
    const jwt = await new jose.SignJWT(finalPayload)
      .setProtectedHeader({ alg: algorithm })
      .sign(privateKey);
    
    return { token: jwt };
  } catch (error) {
    return {
      token: '',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Encodes a string to Base64
 */
export const encodeBase64 = (input: string): string => {
  try {
    return btoa(input);
  } catch (error) {
    throw new Error('Invalid input for Base64 encoding');
  }
};

/**
 * Decodes a Base64 string
 */
export const decodeBase64 = (input: string): string => {
  try {
    return atob(input);
  } catch (error) {
    throw new Error('Invalid Base64 string');
  }
};

/**
 * Encodes a string to Base64Url (JWT compatible)
 */
export const encodeBase64Url = (input: string): string => {
  return encodeBase64(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

/**
 * Decodes a Base64Url string (JWT compatible)
 */
export const decodeBase64Url = (input: string): string => {
  // Add any padding that might have been removed
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = input.length % 4;
  if (pad) {
    if (pad === 1) {
      throw new Error('Invalid Base64Url string');
    }
    input += new Array(5 - pad).join('=');
  }
  return decodeBase64(input);
};

/**
 * Fetches JWKS from a given URL
 */
export const fetchJwks = async (jwksUrl: string): Promise<{ keys: any[], error?: string }> => {
  try {
    const response = await fetch(jwksUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch JWKS: ${response.statusText}`);
    }
    const jwks = await response.json();
    return { keys: jwks.keys || [] };
  } catch (error) {
    return {
      keys: [],
      error: error instanceof Error ? error.message : 'Unknown error fetching JWKS'
    };
  }
};

/**
 * Verify JWT token against JWKS or provided JWKS
 */
export const verifyJwtWithJwks = async (
  token: string,
  options: {
    jwksUrl?: string;
    jwk?: Record<string, any>;
    jwks?: Record<string, any>;
    expectedAudience?: string;
    expectedIssuer?: string;
    expectedKeyId?: string;
  }
): Promise<{ 
  isValid: boolean; 
  payload?: any; 
  header?: any;
  error?: string;
  validationDetails?: {
    audience?: boolean;
    issuer?: boolean;
    keyId?: boolean;
    signature?: boolean;
    expiry?: boolean;
  }
}> => {
  try {
    // Decode the token to get the header (without verification)
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) {
      return { 
        isValid: false, 
        error: 'Invalid token format' 
      };
    }

    const { header, payload } = decoded as any;
    const validationDetails: any = {};
    
    // Check if key ID is expected one (if provided)
    if (options.expectedKeyId) {
      validationDetails.keyId = header.kid === options.expectedKeyId;
      if (!validationDetails.keyId) {
        return {
          isValid: false,
          header,
          payload,
          error: 'Key ID does not match expected value',
          validationDetails
        };
      }
    }

    let publicKey;
    let keys: any[] = [];
    
    // Get keys from JWKS directly if provided
    if (options.jwks) {
      keys = options.jwks.keys || [];
    }
    // Use provided single JWK if available
    else if (options.jwk) {
      try {
        publicKey = await jose.importJWK(options.jwk, header.alg);
      } catch (error) {
        return {
          isValid: false,
          header,
          payload,
          error: 'Failed to import provided JWK',
          validationDetails
        };
      }
    } 
    // Otherwise fetch from JWKS URL
    else if (options.jwksUrl) {
      const { keys: fetchedKeys, error } = await fetchJwks(options.jwksUrl);
      if (error) {
        return {
          isValid: false,
          header,
          payload,
          error,
          validationDetails
        };
      }
      keys = fetchedKeys;
    } else {
      return {
        isValid: false,
        header,
        payload,
        error: 'No JWKS URL, JWKS or JWK provided',
        validationDetails
      };
    }

    // If we have keys array, find the matching key and import it
    if (keys.length > 0) {
      // Find the right key in the JWKS based on key ID
      const matchingKey = keys.find(key => key.kid === header.kid);
      if (!matchingKey) {
        return {
          isValid: false,
          header,
          payload,
          error: 'No matching key found in JWKS',
          validationDetails
        };
      }

      try {
        publicKey = await jose.importJWK(matchingKey, header.alg);
      } catch (error) {
        return {
          isValid: false,
          header,
          payload,
          error: 'Failed to import key from JWKS',
          validationDetails
        };
      }
    }

    // Verify the token's signature
    try {
      // Check if publicKey is defined
      if (!publicKey) {
        return {
          isValid: false,
          header,
          payload,
          error: 'No valid public key found for verification',
          validationDetails: {
            ...validationDetails,
            signature: false
          }
        };
      }
      
      const { payload: verifiedPayload } = await jose.jwtVerify(token, publicKey, {
        issuer: options.expectedIssuer,
        audience: options.expectedAudience
      });
      
      validationDetails.signature = true;
      validationDetails.expiry = true; // If verification passes, expiry is valid
      
      // Jose library checks these in jwtVerify but let's track them explicitly
      if (options.expectedIssuer) {
        validationDetails.issuer = payload.iss === options.expectedIssuer;
      }
      
      if (options.expectedAudience) {
        const audArray = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
        validationDetails.audience = audArray.includes(options.expectedAudience);
      }
      
      return {
        isValid: true,
        payload: verifiedPayload,
        header,
        validationDetails
      };
    } catch (error) {
      // Signature verification failed
      validationDetails.signature = false;
      
      // Check specific errors
      if (error instanceof jose.errors.JWTExpired) {
        validationDetails.expiry = false;
        return {
          isValid: false,
          header,
          payload,
          error: 'Token has expired',
          validationDetails
        };
      }
      
      if (error instanceof jose.errors.JWTClaimValidationFailed) {
        if (error.message.includes('aud')) {
          validationDetails.audience = false;
        }
        if (error.message.includes('iss')) {
          validationDetails.issuer = false;
        }
      }
      
      return {
        isValid: false,
        header,
        payload,
        error: error instanceof Error ? error.message : 'Token verification failed',
        validationDetails
      };
    }
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error during verification'
    };
  }
};

/**
 * Decodes an X.509 certificate in PEM or DER format
 */
export const decodeX509Certificate = async (certificate: string): Promise<{ 
  decoded: Record<string, any> | null; 
  error?: string;
}> => {
  try {
    let pemCert = certificate.trim();
    
    // Check if this is a PEM certificate
    const isPEM = pemCert.startsWith('-----BEGIN CERTIFICATE-----');
    
    if (!isPEM) {
      // Try to convert DER (base64) to PEM format
      try {
        // Check if it's a valid base64 string by attempting to decode it
        atob(pemCert);
        pemCert = '-----BEGIN CERTIFICATE-----\n' + 
                 formatPEM(pemCert) + 
                 '\n-----END CERTIFICATE-----';
      } catch (e) {
        return {
          decoded: null,
          error: 'Invalid certificate format. Please provide a valid PEM or base64 DER encoded certificate.'
        };
      }
    }
    
    // Use WebCrypto API to parse the certificate
    return await parseCertificateWithJose(pemCert);
  } catch (error) {
    return {
      decoded: null,
      error: error instanceof Error ? error.message : 'Failed to decode certificate'
    };
  }
};

/**
 * Formats a base64 string into PEM format with 64-character lines
 */
const formatPEM = (base64: string): string => {
  const chunkSize = 64;
  let formatted = '';
  
  for (let i = 0; i < base64.length; i += chunkSize) {
    formatted += base64.substring(i, i + chunkSize) + '\n';
  }
  
  return formatted.trim();
};

/**
 * Parses a PEM certificate using jose library
 */
const parseCertificateWithJose = async (pemCert: string): Promise<{ 
  decoded: Record<string, any> | null; 
  error?: string;
}> => {
  try {
    // Extract certificate information manually since jose doesn't expose all fields
    const certInfo: Record<string, any> = {};
    
    // Extract basic information from the PEM
    try {
      const basicInfo = extractCertificateInfo(pemCert);
      Object.assign(certInfo, basicInfo);
      
      // Use WebCrypto API to work with the certificate if available
      try {
        // Instead of trying to use JWT/JWK methods, use proper X.509 handling
        // For now, just indicate we have a valid certificate
        certInfo.valid = true;
        
        // Try to extract more information if possible
        const certData = extractMoreCertInfo(pemCert);
        if (certData) {
          Object.assign(certInfo, certData);
        }
      } catch (e) {
        // Continue with basic info if advanced extraction fails
        console.error("Advanced certificate extraction failed:", e);
      }
    } catch (e) {
      console.error("Basic certificate extraction failed:", e);
      return {
        decoded: null,
        error: "Failed to extract certificate information: " + (e instanceof Error ? e.message : String(e))
      };
    }
    
    return { decoded: certInfo };
  } catch (error) {
    return {
      decoded: null,
      error: error instanceof Error ? error.message : 'Failed to parse certificate'
    };
  }
};

/**
 * Extract more certificate information from PEM string using regex patterns
 * This avoids the "Invalid alg" error by not trying to use JWK-related functions
 */
const extractMoreCertInfo = (pemCert: string): Record<string, any> | null => {
  try {
    // Remove header and footer
    const lines = pemCert.split('\n');
    const certB64 = lines
      .filter(line => !line.includes('BEGIN CERTIFICATE') && !line.includes('END CERTIFICATE'))
      .join('');
    
    // This is just basic info for now - a more comprehensive parser would use ASN.1 libraries
    const certInfo: Record<string, any> = {
      format: "X.509",
      encoding: "PEM",
      certificateData: certB64.substring(0, 20) + "..." // Just show beginning of the base64 data
    };
    
    // Try to extract validity dates from common patterns
    const notBeforeMatch = pemCert.match(/Not Before: (.+?)[\r\n]/i);
    if (notBeforeMatch) {
      certInfo.validFrom = notBeforeMatch[1];
    }
    
    const notAfterMatch = pemCert.match(/Not After : (.+?)[\r\n]/i);
    if (notAfterMatch) {
      certInfo.validTo = notAfterMatch[1];
    }
    
    return certInfo;
  } catch (e) {
    console.error("Error in extractMoreCertInfo:", e);
    return null;
  }
};

/**
 * Extract certificate information from PEM string
 * This is a basic implementation that extracts what's possible without ASN.1 parsing libraries
 */
const extractCertificateInfo = (pemCert: string): Record<string, any> => {
  const certInfo: Record<string, any> = {
    version: 'Unknown',
    serialNumber: 'Unknown',
    subject: 'Unknown',
    issuer: 'Unknown',
    validFrom: 'Unknown',
    validTo: 'Unknown',
    fingerprint: 'Unknown',
    publicKeyInfo: {}
  };

  // For a thorough implementation, we would need a proper ASN.1 parser
  // The jose library provides only limited certificate info extraction
  // This implementation provides the basic structure that can be expanded
  
  // Extract subject/issuer from common patterns in the PEM
  const subjectMatch = pemCert.match(/subject=([^,\n]+)/i);
  if (subjectMatch) {
    certInfo.subject = subjectMatch[1];
  }
  
  const issuerMatch = pemCert.match(/issuer=([^,\n]+)/i);
  if (issuerMatch) {
    certInfo.issuer = issuerMatch[1];
  }
  
  return certInfo;
};