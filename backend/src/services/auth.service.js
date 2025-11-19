import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import { config } from '../config/env.js';
import { generateId, timestamp, sanitizeUser } from '../utils/helpers.js';

/**
 * Authentication Service
 */
class AuthService {
  /**
   * Create new user
   */
  async signup(email, password) {
    // Check if user exists
    const existingUser = await this.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const userId = generateId();
    const now = timestamp();
    
    const sql = `
      INSERT INTO users (id, email, password, is_admin, role, created_at, settings)
      VALUES (?, ?, ?, false, 'free', ?, ?)
    `;
    
    const settings = JSON.stringify({ theme: 'light', fontSize: 14 });
    
    await query(sql, [userId, email, hashedPassword, now, settings]);
    
    // Get created user
    const user = await this.getUserById(userId);
    
    // Generate token
    const token = this.generateToken(user);
    
    return {
      user: sanitizeUser(user),
      token
    };
  }

  /**
   * Sign in user
   */
  async signin(email, password) {
    // Get user
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(user);

    return {
      user: sanitizeUser(user),
      token
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const results = await query(sql, [userId]);
    return results[0] || null;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const results = await query(sql, [email]);
    return results[0] || null;
  }

  /**
   * Generate JWT token
   */
  generateToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      isAdmin: user.is_admin || false
    };

    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn
    });
  }

  /**
   * Verify token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

export default new AuthService();
