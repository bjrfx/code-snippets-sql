import { query } from '../config/database.js';
import { generateId, timestamp, ensureArray } from '../utils/helpers.js';

/**
 * Snippet Service
 */
class SnippetService {
  /**
   * Get all snippets for a user
   */
  async getSnippetsByUser(userId) {
    const sql = 'SELECT * FROM snippets WHERE user_id = ? ORDER BY updated_at DESC';
    const snippets = await query(sql, [userId]);
    return snippets.map(snippet => ({
      ...snippet,
      tags: ensureArray(snippet.tags)
    }));
  }

  /**
   * Get snippet by ID
   */
  async getSnippetById(snippetId) {
    const sql = 'SELECT * FROM snippets WHERE id = ?';
    const results = await query(sql, [snippetId]);
    if (!results[0]) return null;
    
    return {
      ...results[0],
      tags: ensureArray(results[0].tags)
    };
  }

  /**
   * Get snippets by folder
   */
  async getSnippetsByFolder(folderId) {
    const sql = 'SELECT * FROM snippets WHERE folder_id = ? ORDER BY updated_at DESC';
    const snippets = await query(sql, [folderId]);
    return snippets.map(snippet => ({
      ...snippet,
      tags: ensureArray(snippet.tags)
    }));
  }

  /**
   * Get snippets by project
   */
  async getSnippetsByProject(projectId) {
    const sql = 'SELECT * FROM snippets WHERE project_id = ? ORDER BY updated_at DESC';
    const snippets = await query(sql, [projectId]);
    return snippets.map(snippet => ({
      ...snippet,
      tags: ensureArray(snippet.tags)
    }));
  }

  /**
   * Create new snippet
   */
  async createSnippet(snippetData) {
    const {
      title,
      content,
      language,
      description = null,
      tags = [],
      folderId = null,
      projectId = null,
      userId
    } = snippetData;

    const snippetId = generateId();
    const now = timestamp();
    
    const sql = `
      INSERT INTO snippets 
      (id, title, content, language, description, tags, folder_id, project_id, user_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const tagsJson = JSON.stringify(tags || []);
    
    await query(sql, [
      snippetId,
      title,
      content,
      language,
      description,
      tagsJson,
      folderId,
      projectId,
      userId,
      now,
      now
    ]);
    
    return this.getSnippetById(snippetId);
  }

  /**
   * Update snippet
   */
  async updateSnippet(snippetId, updates) {
    const allowedUpdates = ['title', 'content', 'language', 'description', 'tags', 'folder_id', 'project_id'];
    const updateFields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      if (allowedUpdates.includes(snakeKey)) {
        updateFields.push(`${snakeKey} = ?`);
        values.push(key === 'tags' ? JSON.stringify(value) : value);
      }
    }

    if (updateFields.length === 0) {
      return this.getSnippetById(snippetId);
    }

    // Add updated_at
    updateFields.push('updated_at = ?');
    values.push(timestamp());
    values.push(snippetId);

    const sql = `UPDATE snippets SET ${updateFields.join(', ')} WHERE id = ?`;
    await query(sql, values);
    
    return this.getSnippetById(snippetId);
  }

  /**
   * Delete snippet
   */
  async deleteSnippet(snippetId) {
    const sql = 'DELETE FROM snippets WHERE id = ?';
    await query(sql, [snippetId]);
  }

  /**
   * Search snippets
   */
  async searchSnippets(userId, searchTerm) {
    const sql = `
      SELECT * FROM snippets 
      WHERE user_id = ? AND (
        title LIKE ? OR 
        content LIKE ? OR 
        description LIKE ?
      )
      ORDER BY updated_at DESC
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const snippets = await query(sql, [userId, searchPattern, searchPattern, searchPattern]);
    
    return snippets.map(snippet => ({
      ...snippet,
      tags: ensureArray(snippet.tags)
    }));
  }
}

export default new SnippetService();
