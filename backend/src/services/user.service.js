import { query } from '../config/database.js';
import { sanitizeUser } from '../utils/helpers.js';

/**
 * User Service
 */
class UserService {
  /**
   * Get all users
   */
  async getAllUsers() {
    const sql = 'SELECT * FROM users ORDER BY created_at DESC';
    const users = await query(sql);
    return users.map(sanitizeUser);
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const results = await query(sql, [userId]);
    return results[0] ? sanitizeUser(results[0]) : null;
  }

  /**
   * Update user
   */
  async updateUser(userId, updates) {
    const allowedUpdates = ['email', 'is_admin', 'role', 'settings', 'display_name', 'photo_url'];
    const updateFields = [];
    const values = [];

    // Build update query dynamically
    for (const [key, value] of Object.entries(updates)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      if (allowedUpdates.includes(snakeKey)) {
        updateFields.push(`${snakeKey} = ?`);
        values.push(typeof value === 'object' ? JSON.stringify(value) : value);
      }
    }

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(userId);
    const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    
    await query(sql, values);
    
    return this.getUserById(userId);
  }

  /**
   * Delete user
   */
  async deleteUser(userId) {
    const sql = 'DELETE FROM users WHERE id = ?';
    await query(sql, [userId]);
  }

  /**
   * Check if user is admin
   */
  async isAdmin(userId) {
    const user = await this.getUserById(userId);
    return user?.is_admin || false;
  }
}

export default new UserService();
