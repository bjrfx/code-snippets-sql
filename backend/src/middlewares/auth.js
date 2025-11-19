import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

/**
 * Verify JWT token and attach user info to request
 */
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required. No token provided.' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required. Invalid token format.' 
      });
    }
    
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      req.userId = decoded.userId;
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false,
          message: 'Token has expired. Please login again.' 
        });
      }
      return res.status(401).json({ 
        success: false,
        message: 'Invalid or expired token' 
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Authentication failed' 
    });
  }
};

/**
 * Check if user is admin
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ 
      success: false,
      message: 'Admin access required' 
    });
  }
  next();
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    
    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.userId = decoded.userId;
        req.user = decoded;
      } catch (error) {
        // Token invalid but continue without auth
        console.log('Optional auth: Invalid token, continuing without authentication');
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    next();
  }
};

export default { authenticate, requireAdmin, optionalAuth };
