import { db } from "./db";
import { users, snippets, notes, checklists, smartNotes, projects, folders, tags, premiumRequests } from "@shared/schema";
import type { User, Snippet, Note, Checklist, SmartNote, Project, Folder, Tag, PremiumRequest } from "@shared/schema";
import { eq, and, or, like, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(email: string, password: string): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
  
  // Snippet operations
  getSnippet(id: string): Promise<Snippet | undefined>;
  getSnippetsByUser(userId: string): Promise<Snippet[]>;
  getSnippetsByFolder(folderId: string): Promise<Snippet[]>;
  getSnippetsByProject(projectId: string): Promise<Snippet[]>;
  createSnippet(snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Snippet>;
  updateSnippet(id: string, data: Partial<Snippet>): Promise<Snippet | undefined>;
  deleteSnippet(id: string): Promise<void>;
  searchSnippets(userId: string, searchTerm: string): Promise<Snippet[]>;
  
  // Note operations
  getNote(id: string): Promise<Note | undefined>;
  getNotesByUser(userId: string): Promise<Note[]>;
  getNotesByFolder(folderId: string): Promise<Note[]>;
  getNotesByProject(projectId: string): Promise<Note[]>;
  createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note>;
  updateNote(id: string, data: Partial<Note>): Promise<Note | undefined>;
  deleteNote(id: string): Promise<void>;
  searchNotes(userId: string, searchTerm: string): Promise<Note[]>;
  
  // Checklist operations
  getChecklist(id: string): Promise<Checklist | undefined>;
  getChecklistsByUser(userId: string): Promise<Checklist[]>;
  getChecklistsByFolder(folderId: string): Promise<Checklist[]>;
  getChecklistsByProject(projectId: string): Promise<Checklist[]>;
  createChecklist(checklist: Omit<Checklist, 'id' | 'createdAt' | 'updatedAt'>): Promise<Checklist>;
  updateChecklist(id: string, data: Partial<Checklist>): Promise<Checklist | undefined>;
  deleteChecklist(id: string): Promise<void>;
  searchChecklists(userId: string, searchTerm: string): Promise<Checklist[]>;
  
  // Smart Note operations
  getSmartNote(id: string): Promise<SmartNote | undefined>;
  getSmartNotesByUser(userId: string): Promise<SmartNote[]>;
  getSmartNotesByFolder(folderId: string): Promise<SmartNote[]>;
  getSmartNotesByProject(projectId: string): Promise<SmartNote[]>;
  createSmartNote(smartNote: Omit<SmartNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<SmartNote>;
  updateSmartNote(id: string, data: Partial<SmartNote>): Promise<SmartNote | undefined>;
  deleteSmartNote(id: string): Promise<void>;
  searchSmartNotes(userId: string, searchTerm: string): Promise<SmartNote[]>;
  
  // Project operations
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByUser(userId: string): Promise<Project[]>;
  createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project>;
  updateProject(id: string, data: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<void>;
  
  // Folder operations
  getFolder(id: string): Promise<Folder | undefined>;
  getFoldersByUser(userId: string): Promise<Folder[]>;
  createFolder(folder: Omit<Folder, 'id' | 'createdAt'>): Promise<Folder>;
  deleteFolder(id: string): Promise<void>;
  
  // Tag operations
  getTag(id: string): Promise<Tag | undefined>;
  getTagsByUser(userId: string): Promise<Tag[]>;
  createTag(tag: Omit<Tag, 'id'>): Promise<Tag>;
  deleteTag(id: string): Promise<void>;
  
  // Premium request operations
  getPremiumRequest(id: string): Promise<PremiumRequest | undefined>;
  getPremiumRequestsByUser(userId: string): Promise<PremiumRequest[]>;
  getAllPremiumRequests(): Promise<PremiumRequest[]>;
  createPremiumRequest(request: Omit<PremiumRequest, 'id' | 'createdAt'>): Promise<PremiumRequest>;
  updatePremiumRequest(id: string, data: Partial<PremiumRequest>): Promise<PremiumRequest | undefined>;
  deletePremiumRequest(id: string): Promise<void>;
}

export class MySQLStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(email: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = nanoid();
    const now = Date.now();
    
    const newUser: User = {
      id,
      email,
      password: hashedPassword,
      isAdmin: false,
      role: "free",
      createdAt: now,
      settings: { theme: "light", fontSize: 14 },
    };

    await db.insert(users).values(newUser);
    return newUser;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    await db.update(users).set(data).where(eq(users.id, id));
    return this.getUser(id);
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  // Snippet operations
  async getSnippet(id: string): Promise<Snippet | undefined> {
    const [snippet] = await db.select().from(snippets).where(eq(snippets.id, id));
    if (!snippet) return undefined;
    // Ensure tags is always an array and parse if it's a string
    return {
      ...snippet,
      tags: Array.isArray(snippet.tags) 
        ? snippet.tags 
        : (typeof snippet.tags === 'string' 
            ? JSON.parse(snippet.tags) 
            : [])
    };
  }

  async getSnippetsByUser(userId: string): Promise<Snippet[]> {
    const results = await db.select().from(snippets).where(eq(snippets.userId, userId));
    // Ensure tags is always an array and parse if it's a string
    return results.map(snippet => ({
      ...snippet,
      tags: Array.isArray(snippet.tags) 
        ? snippet.tags 
        : (typeof snippet.tags === 'string' 
            ? JSON.parse(snippet.tags) 
            : [])
    }));
  }

  async getSnippetsByFolder(folderId: string): Promise<Snippet[]> {
    return db.select().from(snippets).where(eq(snippets.folderId, folderId));
  }

  async getSnippetsByProject(projectId: string): Promise<Snippet[]> {
    return db.select().from(snippets).where(eq(snippets.projectId, projectId));
  }

  async createSnippet(snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Snippet> {
    const now = Date.now();
    const newSnippet: Snippet = {
      ...snippet,
      id: nanoid(),
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(snippets).values(newSnippet);
    return newSnippet;
  }

  async updateSnippet(id: string, data: Partial<Snippet>): Promise<Snippet | undefined> {
    await db.update(snippets).set({ ...data, updatedAt: Date.now() }).where(eq(snippets.id, id));
    return this.getSnippet(id);
  }

  async deleteSnippet(id: string): Promise<void> {
    await db.delete(snippets).where(eq(snippets.id, id));
  }

  async searchSnippets(userId: string, searchTerm: string): Promise<Snippet[]> {
    return db.select().from(snippets).where(
      and(
        eq(snippets.userId, userId),
        or(
          like(snippets.title, `%${searchTerm}%`),
          like(snippets.content, `%${searchTerm}%`),
          like(snippets.description, `%${searchTerm}%`)
        )
      )
    );
  }

  // Note operations
  async getNote(id: string): Promise<Note | undefined> {
    const [note] = await db.select().from(notes).where(eq(notes.id, id));
    if (!note) return undefined;
    // Ensure tags is always an array and parse if it's a string
    return {
      ...note,
      tags: Array.isArray(note.tags) 
        ? note.tags 
        : (typeof note.tags === 'string' 
            ? JSON.parse(note.tags) 
            : [])
    };
  }

  async getNotesByUser(userId: string): Promise<Note[]> {
    const results = await db.select().from(notes).where(eq(notes.userId, userId));
    // Ensure tags is always an array and parse if it's a string
    return results.map(note => ({
      ...note,
      tags: Array.isArray(note.tags) 
        ? note.tags 
        : (typeof note.tags === 'string' 
            ? JSON.parse(note.tags) 
            : [])
    }));
  }

  async getNotesByFolder(folderId: string): Promise<Note[]> {
    return db.select().from(notes).where(eq(notes.folderId, folderId));
  }

  async getNotesByProject(projectId: string): Promise<Note[]> {
    return db.select().from(notes).where(eq(notes.projectId, projectId));
  }

  async createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    const now = Date.now();
    const newNote: Note = {
      ...note,
      id: nanoid(),
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(notes).values(newNote);
    return newNote;
  }

  async updateNote(id: string, data: Partial<Note>): Promise<Note | undefined> {
    await db.update(notes).set({ ...data, updatedAt: Date.now() }).where(eq(notes.id, id));
    return this.getNote(id);
  }

  async deleteNote(id: string): Promise<void> {
    await db.delete(notes).where(eq(notes.id, id));
  }

  async searchNotes(userId: string, searchTerm: string): Promise<Note[]> {
    return db.select().from(notes).where(
      and(
        eq(notes.userId, userId),
        or(
          like(notes.title, `%${searchTerm}%`),
          like(notes.content, `%${searchTerm}%`)
        )
      )
    );
  }

  // Checklist operations
  async getChecklist(id: string): Promise<Checklist | undefined> {
    const [checklist] = await db.select().from(checklists).where(eq(checklists.id, id));
    if (!checklist) return undefined;
    // Ensure tags and items are always arrays and parse if they're strings
    return {
      ...checklist,
      tags: Array.isArray(checklist.tags) 
        ? checklist.tags 
        : (typeof checklist.tags === 'string' 
            ? JSON.parse(checklist.tags) 
            : []),
      items: Array.isArray(checklist.items) 
        ? checklist.items 
        : (typeof checklist.items === 'string' 
            ? JSON.parse(checklist.items) 
            : [])
    };
  }

  async getChecklistsByUser(userId: string): Promise<Checklist[]> {
    const results = await db.select().from(checklists).where(eq(checklists.userId, userId));
    // Ensure tags and items are always arrays and parse if they're strings
    return results.map(checklist => ({
      ...checklist,
      tags: Array.isArray(checklist.tags) 
        ? checklist.tags 
        : (typeof checklist.tags === 'string' 
            ? JSON.parse(checklist.tags) 
            : []),
      items: Array.isArray(checklist.items) 
        ? checklist.items 
        : (typeof checklist.items === 'string' 
            ? JSON.parse(checklist.items) 
            : [])
    }));
  }

  async getChecklistsByFolder(folderId: string): Promise<Checklist[]> {
    return db.select().from(checklists).where(eq(checklists.folderId, folderId));
  }

  async getChecklistsByProject(projectId: string): Promise<Checklist[]> {
    return db.select().from(checklists).where(eq(checklists.projectId, projectId));
  }

  async createChecklist(checklist: Omit<Checklist, 'id' | 'createdAt' | 'updatedAt'>): Promise<Checklist> {
    const now = Date.now();
    const newChecklist: Checklist = {
      ...checklist,
      id: nanoid(),
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(checklists).values(newChecklist);
    return newChecklist;
  }

  async updateChecklist(id: string, data: Partial<Checklist>): Promise<Checklist | undefined> {
    await db.update(checklists).set({ ...data, updatedAt: Date.now() }).where(eq(checklists.id, id));
    return this.getChecklist(id);
  }

  async deleteChecklist(id: string): Promise<void> {
    await db.delete(checklists).where(eq(checklists.id, id));
  }

  async searchChecklists(userId: string, searchTerm: string): Promise<Checklist[]> {
    return db.select().from(checklists).where(
      and(
        eq(checklists.userId, userId),
        like(checklists.title, `%${searchTerm}%`)
      )
    );
  }

  // Smart Note operations
  async getSmartNote(id: string): Promise<SmartNote | undefined> {
    const [smartNote] = await db.select().from(smartNotes).where(eq(smartNotes.id, id));
    if (!smartNote) return undefined;
    return {
      ...smartNote,
      tags: Array.isArray(smartNote.tags) 
        ? smartNote.tags 
        : (typeof smartNote.tags === 'string' 
            ? JSON.parse(smartNote.tags) 
            : []),
      folderId: smartNote.folderId ?? undefined,
      projectId: smartNote.projectId ?? undefined,
    } as SmartNote;
  }

  async getSmartNotesByUser(userId: string): Promise<SmartNote[]> {
    const results = await db.select().from(smartNotes).where(eq(smartNotes.userId, userId));
    return results.map(smartNote => ({
      ...smartNote,
      tags: Array.isArray(smartNote.tags) 
        ? smartNote.tags 
        : (typeof smartNote.tags === 'string' 
            ? JSON.parse(smartNote.tags) 
            : []),
      folderId: smartNote.folderId ?? undefined,
      projectId: smartNote.projectId ?? undefined,
    })) as SmartNote[];
  }

  async getSmartNotesByFolder(folderId: string): Promise<SmartNote[]> {
    const results = await db.select().from(smartNotes).where(eq(smartNotes.folderId, folderId));
    return results.map(smartNote => ({
      ...smartNote,
      folderId: smartNote.folderId ?? undefined,
      projectId: smartNote.projectId ?? undefined,
    })) as SmartNote[];
  }

  async getSmartNotesByProject(projectId: string): Promise<SmartNote[]> {
    const results = await db.select().from(smartNotes).where(eq(smartNotes.projectId, projectId));
    return results.map(smartNote => ({
      ...smartNote,
      folderId: smartNote.folderId ?? undefined,
      projectId: smartNote.projectId ?? undefined,
    })) as SmartNote[];
  }

  async createSmartNote(smartNote: Omit<SmartNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<SmartNote> {
    const now = Date.now();
    const newSmartNote: SmartNote = {
      ...smartNote,
      id: nanoid(),
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(smartNotes).values(newSmartNote);
    return newSmartNote;
  }

  async updateSmartNote(id: string, data: Partial<SmartNote>): Promise<SmartNote | undefined> {
    await db.update(smartNotes).set({ ...data, updatedAt: Date.now() }).where(eq(smartNotes.id, id));
    return this.getSmartNote(id);
  }

  async deleteSmartNote(id: string): Promise<void> {
    await db.delete(smartNotes).where(eq(smartNotes.id, id));
  }

  async searchSmartNotes(userId: string, searchTerm: string): Promise<SmartNote[]> {
    const results = await db.select().from(smartNotes).where(
      and(
        eq(smartNotes.userId, userId),
        or(
          like(smartNotes.title, `%${searchTerm}%`),
          like(smartNotes.content, `%${searchTerm}%`)
        )
      )
    );
    return results.map(smartNote => ({
      ...smartNote,
      folderId: smartNote.folderId ?? undefined,
      projectId: smartNote.projectId ?? undefined,
    })) as SmartNote[];
  }

  // Project operations
  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getProjectsByUser(userId: string): Promise<Project[]> {
    const result = await db.select().from(projects).where(eq(projects.userId, userId));
    console.log('getProjectsByUser result:', JSON.stringify(result, null, 2));
    // Convert null to undefined for description field
    return result.map(p => ({
      ...p,
      description: p.description ?? undefined
    }));
  }

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const now = Date.now();
    const newProject: Project = {
      ...project,
      id: nanoid(),
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(projects).values(newProject);
    return newProject;
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project | undefined> {
    await db.update(projects).set({ ...data, updatedAt: Date.now() }).where(eq(projects.id, id));
    return this.getProject(id);
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Folder operations
  async getFolder(id: string): Promise<Folder | undefined> {
    const [folder] = await db.select().from(folders).where(eq(folders.id, id));
    return folder;
  }

  async getFoldersByUser(userId: string): Promise<Folder[]> {
    return db.select().from(folders).where(eq(folders.userId, userId));
  }

  async createFolder(folder: Omit<Folder, 'id' | 'createdAt'>): Promise<Folder> {
    const newFolder: Folder = {
      ...folder,
      id: nanoid(),
      createdAt: Date.now(),
    };
    await db.insert(folders).values(newFolder);
    return newFolder;
  }

  async deleteFolder(id: string): Promise<void> {
    await db.delete(folders).where(eq(folders.id, id));
  }

  // Tag operations
  async getTag(id: string): Promise<Tag | undefined> {
    const [tag] = await db.select().from(tags).where(eq(tags.id, id));
    return tag;
  }

  async getTagsByUser(userId: string): Promise<Tag[]> {
    return db.select().from(tags).where(eq(tags.userId, userId));
  }

  async createTag(tag: Omit<Tag, 'id'>): Promise<Tag> {
    const newTag: Tag = {
      ...tag,
      id: nanoid(),
    };
    await db.insert(tags).values(newTag);
    return newTag;
  }

  async deleteTag(id: string): Promise<void> {
    await db.delete(tags).where(eq(tags.id, id));
  }

  // Premium request operations
  async getPremiumRequest(id: string): Promise<PremiumRequest | undefined> {
    const [request] = await db.select().from(premiumRequests).where(eq(premiumRequests.id, id));
    return request;
  }

  async getPremiumRequestsByUser(userId: string): Promise<PremiumRequest[]> {
    return db.select().from(premiumRequests).where(eq(premiumRequests.userId, userId));
  }

  async getAllPremiumRequests(): Promise<PremiumRequest[]> {
    return db.select().from(premiumRequests).orderBy(desc(premiumRequests.createdAt));
  }

  async createPremiumRequest(request: Omit<PremiumRequest, 'id' | 'createdAt'>): Promise<PremiumRequest> {
    const newRequest: PremiumRequest = {
      ...request,
      id: nanoid(),
      createdAt: Date.now(),
    };
    await db.insert(premiumRequests).values(newRequest);
    return newRequest;
  }

  async updatePremiumRequest(id: string, data: Partial<PremiumRequest>): Promise<PremiumRequest | undefined> {
    await db.update(premiumRequests).set(data).where(eq(premiumRequests.id, id));
    return this.getPremiumRequest(id);
  }

  async deletePremiumRequest(id: string): Promise<void> {
    await db.delete(premiumRequests).where(eq(premiumRequests.id, id));
  }
}

export const storage = new MySQLStorage();
