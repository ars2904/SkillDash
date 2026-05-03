const jwt = require('jsonwebtoken');
const pool = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'skilldash_secret_key_change_in_production';
const JWT_EXPIRY = '7d';

/**
 * Generate a JWT token for a user
 */
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Middleware: Verify JWT token from Authorization header
 * Attaches `req.user` with { userId } on success
 */
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Fetch user to check if banned
    const [users] = await pool.query('SELECT id, is_banned, is_admin FROM users WHERE id = ?', [decoded.userId]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'User not found.' });
    }

    if (users[0].is_banned) {
      return res.status(403).json({ error: 'Account suspended. Contact support.' });
    }

    req.user = { 
      userId: decoded.userId,
      isAdmin: users[0].is_admin === 1
    };
    
    // Update last_active timestamp
    pool.query('UPDATE users SET last_active = NOW() WHERE id = ?', [decoded.userId]).catch(() => {});
    
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please login again.' });
    }
    return res.status(403).json({ error: 'Invalid token.' });
  }
}

/**
 * Middleware: Require admin role (must be used AFTER authenticateToken)
 */
function requireAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}

module.exports = { generateToken, authenticateToken, requireAdmin };
