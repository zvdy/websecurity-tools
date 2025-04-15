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