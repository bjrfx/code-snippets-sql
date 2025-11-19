import { query } from '../config/database.js';
import { generateId, timestamp } from '../utils/helpers.js';

/**
 * Project Service
 */
class ProjectService {
  /**
   * Get all projects for a user
   */
  async getProjectsByUser(userId) {
    const sql = 'SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC';
    const projects = await query(sql, [userId]);
    return projects;
  }

  /**
   * Get project by ID
   */
  async getProjectById(projectId) {
    const sql = 'SELECT * FROM projects WHERE id = ?';
    const results = await query(sql, [projectId]);
    return results[0] || null;
  }

  /**
   * Create new project
   */
  async createProject(projectData) {
    const {
      name,
      description = null,
      userId
    } = projectData;

    const projectId = generateId();
    const now = timestamp();
    
    const sql = `
      INSERT INTO projects 
      (id, name, description, user_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    await query(sql, [
      projectId,
      name,
      description,
      userId,
      now,
      now
    ]);
    
    return this.getProjectById(projectId);
  }

  /**
   * Update project
   */
  async updateProject(projectId, updates) {
    const allowedUpdates = ['name', 'description'];
    const updateFields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedUpdates.includes(key)) {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updateFields.length === 0) {
      return this.getProjectById(projectId);
    }

    // Add updated_at
    updateFields.push('updated_at = ?');
    values.push(timestamp());
    values.push(projectId);

    const sql = `UPDATE projects SET ${updateFields.join(', ')} WHERE id = ?`;
    await query(sql, values);
    
    return this.getProjectById(projectId);
  }

  /**
   * Delete project
   */
  async deleteProject(projectId) {
    const sql = 'DELETE FROM projects WHERE id = ?';
    await query(sql, [projectId]);
  }

  /**
   * Get project statistics
   */
  async getProjectStats(projectId, userId) {
    const queries = [
      query('SELECT COUNT(*) as count FROM snippets WHERE project_id = ? AND user_id = ?', [projectId, userId]),
      query('SELECT COUNT(*) as count FROM notes WHERE project_id = ? AND user_id = ?', [projectId, userId]),
      query('SELECT COUNT(*) as count FROM checklists WHERE project_id = ? AND user_id = ?', [projectId, userId]),
      query('SELECT COUNT(*) as count FROM smart_notes WHERE project_id = ? AND user_id = ?', [projectId, userId])
    ];

    const [snippetResult, noteResult, checklistResult, smartNoteResult] = await Promise.all(queries);

    const snippets = snippetResult[0]?.count || 0;
    const notes = noteResult[0]?.count || 0;
    const checklists = checklistResult[0]?.count || 0;
    const smartNotes = smartNoteResult[0]?.count || 0;

    return {
      snippets,
      notes,
      checklists,
      smartNotes,
      total: snippets + notes + checklists + smartNotes
    };
  }
}

export default new ProjectService();
