import { query } from '../config/database.js';
import { generateId, timestamp, ensureArray } from '../utils/helpers.js';

/**
 * Note Service
 */
class NoteService {
  /**
   * Get all notes for a user
   */
  async getNotesByUser(userId) {
    const sql = 'SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC';
    const notes = await query(sql, [userId]);
    return notes.map(note => ({
      ...note,
      tags: ensureArray(note.tags)
    }));
  }

  /**
   * Get note by ID
   */
  async getNoteById(noteId) {
    const sql = 'SELECT * FROM notes WHERE id = ?';
    const results = await query(sql, [noteId]);
    if (!results[0]) return null;
    
    return {
      ...results[0],
      tags: ensureArray(results[0].tags)
    };
  }

  /**
   * Get notes by folder
   */
  async getNotesByFolder(folderId) {
    const sql = 'SELECT * FROM notes WHERE folder_id = ? ORDER BY updated_at DESC';
    const notes = await query(sql, [folderId]);
    return notes.map(note => ({
      ...note,
      tags: ensureArray(note.tags)
    }));
  }

  /**
   * Get notes by project
   */
  async getNotesByProject(projectId) {
    const sql = 'SELECT * FROM notes WHERE project_id = ? ORDER BY updated_at DESC';
    const notes = await query(sql, [projectId]);
    return notes.map(note => ({
      ...note,
      tags: ensureArray(note.tags)
    }));
  }

  /**
   * Create new note
   */
  async createNote(noteData) {
    const {
      title,
      content,
      tags = [],
      folderId = null,
      projectId = null,
      userId
    } = noteData;

    const noteId = generateId();
    const now = timestamp();
    
    const sql = `
      INSERT INTO notes 
      (id, title, content, tags, folder_id, project_id, user_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const tagsJson = JSON.stringify(tags || []);
    
    await query(sql, [
      noteId,
      title,
      content,
      tagsJson,
      folderId,
      projectId,
      userId,
      now,
      now
    ]);
    
    return this.getNoteById(noteId);
  }

  /**
   * Update note
   */
  async updateNote(noteId, updates) {
    const allowedUpdates = ['title', 'content', 'tags', 'folder_id', 'project_id'];
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
      return this.getNoteById(noteId);
    }

    // Add updated_at
    updateFields.push('updated_at = ?');
    values.push(timestamp());
    values.push(noteId);

    const sql = `UPDATE notes SET ${updateFields.join(', ')} WHERE id = ?`;
    await query(sql, values);
    
    return this.getNoteById(noteId);
  }

  /**
   * Delete note
   */
  async deleteNote(noteId) {
    const sql = 'DELETE FROM notes WHERE id = ?';
    await query(sql, [noteId]);
  }

  /**
   * Search notes
   */
  async searchNotes(userId, searchTerm) {
    const sql = `
      SELECT * FROM notes 
      WHERE user_id = ? AND (
        title LIKE ? OR 
        content LIKE ?
      )
      ORDER BY updated_at DESC
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const notes = await query(sql, [userId, searchPattern, searchPattern]);
    
    return notes.map(note => ({
      ...note,
      tags: ensureArray(note.tags)
    }));
  }
}

export default new NoteService();
