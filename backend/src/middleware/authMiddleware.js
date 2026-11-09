/**
 * authMiddleware.js
 *
 * Custom Clerk JWT verifier using the public JWKS endpoint.
 * Works WITHOUT CLERK_SECRET_KEY — only needs CLERK_PUBLISHABLE_KEY.
 *
 * Flow:
 *  1. Extract Bearer token from Authorization header.
 *  2. Decode the JWT header to get the `kid`.
 *  3. Fetch matching JWK from Clerk's JWKS endpoint (cached 10 min).
 *  4. Verify the JWT signature and expiry.
 *  5. Attach req.auth = { userId } so downstream routes work identically
 *     to @clerk/express requireAuth().
 */

const https = require('https');
const crypto = require('crypto');

// ── Derive JWKS URL from publishable key ─────────────────────────────────────
function getJwksUrl() {
  const pk = process.env.CLERK_PUBLISHABLE_KEY || '';
  // pk_test_<base64>  or  pk_live_<base64>
  const base64Part = pk.replace(/^pk_(test|live)_/, '');
  if (!base64Part) {
    throw new Error('[authMiddleware] CLERK_PUBLISHABLE_KEY is not set.');
  }
  // The base64 payload ends with a trailing '$' — strip it before decoding
  const frontendApi = Buffer.from(base64Part, 'base64')
    .toString('utf8')
    .replace(/\$$/, '');
  return `https://${frontendApi}/.well-known/jwks.json`;
}

// ── Simple in-memory JWKS cache (10 minutes) ─────────────────────────────────
let jwksCache = null;
let jwksCacheExpiry = 0;

function fetchJwks() {
  return new Promise((resolve, reject) => {
    if (jwksCache && Date.now() < jwksCacheExpiry) {
      return resolve(jwksCache);
    }
    const url = getJwksUrl();
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          jwksCache = parsed.keys || [];
          jwksCacheExpiry = Date.now() + 10 * 60 * 1000; // 10 min TTL
          resolve(jwksCache);
        } catch (e) {
          reject(new Error('[authMiddleware] Failed to parse JWKS response.'));
        }
      });
    }).on('error', (err) => {
      reject(new Error(`[authMiddleware] JWKS fetch failed: ${err.message}`));
    });
  });
}

// ── Import a JWK into a Node crypto KeyObject ─────────────────────────────────
function importRsaJwk(jwk) {
  return crypto.createPublicKey({ key: jwk, format: 'jwk' });
}

// ── Decode a JWT without verifying (to extract header/payload) ────────────────
function decodeJwtParts(token) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT format');
  const header  = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  return { header, payload, parts };
}

// ── Verify RS256 JWT signature ────────────────────────────────────────────────
function verifyRs256Signature(token, publicKey) {
  const parts = token.split('.');
  const signingInput = `${parts[0]}.${parts[1]}`;
  const signature = Buffer.from(parts[2], 'base64url');
  return crypto.verify(
    'sha256',
    Buffer.from(signingInput),
    { key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING },
    signature
  );
}

// ── Main middleware ────────────────────────────────────────────────────────────
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization token', code: 'UNAUTHORIZED' });
    }

    const token = authHeader.slice(7);
    const { header, payload } = decodeJwtParts(token);

    // Check expiry
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }

    // Fetch JWKS and find matching key by kid
    const keys = await fetchJwks();
    const jwk = keys.find((k) => k.kid === header.kid);
    if (!jwk) {
      return res.status(401).json({ error: 'Unknown JWT key ID', code: 'INVALID_TOKEN' });
    }

    // Import the JWK and verify signature
    const publicKey = importRsaJwk(jwk);
    const valid = verifyRs256Signature(token, publicKey);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid token signature', code: 'INVALID_TOKEN' });
    }

    // Attach auth context — same shape as @clerk/express
    req.auth = {
      userId: payload.sub,
      sessionId: payload.sid,
      sessionClaims: payload,
    };

    next();
  } catch (err) {
    console.error('[authMiddleware] Verification error:', err.message);
    return res.status(401).json({ error: 'Authentication failed', code: 'AUTH_ERROR', detail: err.message });
  }
}

module.exports = authMiddleware;
