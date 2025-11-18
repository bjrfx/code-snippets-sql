import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Middleware to verify JWT token
function authenticate(req: any, res: any, next: any) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ==================== AUTH ROUTES ====================
  
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser(email, password);
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      
      // Don't send password to client
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword, token });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to create user" });
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      
      // Don't send password to client
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to sign in" });
    }
  });

  app.get("/api/auth/me", authenticate, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch user" });
    }
  });

  // ==================== USER ROUTES ====================
  
  app.get("/api/users", authenticate, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", authenticate, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch user" });
    }
  });

  app.patch("/api/users/:id", authenticate, async (req: any, res) => {
    try {
      if (req.userId !== req.params.id) {
        // Check if user is admin
        const currentUser = await storage.getUser(req.userId);
        if (!currentUser?.isAdmin) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      
      const user = await storage.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", authenticate, async (req: any, res) => {
    try {
      // Only allow users to delete their own account or admins to delete any account
      const currentUser = await storage.getUser(req.userId);
      if (req.userId !== req.params.id && !currentUser?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteUser(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete user" });
    }
  });

  // ==================== SNIPPET ROUTES ====================
  
  app.get("/api/snippets", authenticate, async (req: any, res) => {
    try {
      const snippets = await storage.getSnippetsByUser(req.userId);
      res.json(snippets);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch snippets" });
    }
  });

  app.get("/api/snippets/:id", authenticate, async (req, res) => {
    try {
      const snippet = await storage.getSnippet(req.params.id);
      if (!snippet) {
        return res.status(404).json({ message: "Snippet not found" });
      }
      res.json(snippet);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch snippet" });
    }
  });

  app.post("/api/snippets", authenticate, async (req: any, res) => {
    try {
      const snippet = await storage.createSnippet({ ...req.body, userId: req.userId });
      res.status(201).json(snippet);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to create snippet" });
    }
  });

  app.patch("/api/snippets/:id", authenticate, async (req, res) => {
    try {
      const snippet = await storage.updateSnippet(req.params.id, req.body);
      if (!snippet) {
        return res.status(404).json({ message: "Snippet not found" });
      }
      res.json(snippet);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update snippet" });
    }
  });

  app.delete("/api/snippets/:id", authenticate, async (req, res) => {
    try {
      await storage.deleteSnippet(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete snippet" });
    }
  });

  app.get("/api/folders/:folderId/snippets", authenticate, async (req, res) => {
    try {
      const snippets = await storage.getSnippetsByFolder(req.params.folderId);
      res.json(snippets);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch snippets" });
    }
  });

  app.get("/api/projects/:projectId/snippets", authenticate, async (req, res) => {
    try {
      const snippets = await storage.getSnippetsByProject(req.params.projectId);
      res.json(snippets);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch snippets" });
    }
  });

  // ==================== NOTE ROUTES ====================
  
  app.get("/api/notes", authenticate, async (req: any, res) => {
    try {
      const notes = await storage.getNotesByUser(req.userId);
      res.json(notes);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch notes" });
    }
  });

  app.get("/api/notes/:id", authenticate, async (req, res) => {
    try {
      const note = await storage.getNote(req.params.id);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.json(note);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch note" });
    }
  });

  app.post("/api/notes", authenticate, async (req: any, res) => {
    try {
      const note = await storage.createNote({ ...req.body, userId: req.userId });
      res.status(201).json(note);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to create note" });
    }
  });

  app.patch("/api/notes/:id", authenticate, async (req, res) => {
    try {
      const note = await storage.updateNote(req.params.id, req.body);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.json(note);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update note" });
    }
  });

  app.delete("/api/notes/:id", authenticate, async (req, res) => {
    try {
      await storage.deleteNote(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete note" });
    }
  });

  app.get("/api/folders/:folderId/notes", authenticate, async (req, res) => {
    try {
      const notes = await storage.getNotesByFolder(req.params.folderId);
      res.json(notes);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch notes" });
    }
  });

  app.get("/api/projects/:projectId/notes", authenticate, async (req, res) => {
    try {
      const notes = await storage.getNotesByProject(req.params.projectId);
      res.json(notes);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch notes" });
    }
  });

  // ==================== CHECKLIST ROUTES ====================
  
  app.get("/api/checklists", authenticate, async (req: any, res) => {
    try {
      const checklists = await storage.getChecklistsByUser(req.userId);
      res.json(checklists);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch checklists" });
    }
  });

  app.get("/api/checklists/:id", authenticate, async (req, res) => {
    try {
      const checklist = await storage.getChecklist(req.params.id);
      if (!checklist) {
        return res.status(404).json({ message: "Checklist not found" });
      }
      res.json(checklist);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch checklist" });
    }
  });

  app.post("/api/checklists", authenticate, async (req: any, res) => {
    try {
      const checklist = await storage.createChecklist({ ...req.body, userId: req.userId });
      res.status(201).json(checklist);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to create checklist" });
    }
  });

  app.patch("/api/checklists/:id", authenticate, async (req, res) => {
    try {
      const checklist = await storage.updateChecklist(req.params.id, req.body);
      if (!checklist) {
        return res.status(404).json({ message: "Checklist not found" });
      }
      res.json(checklist);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update checklist" });
    }
  });

  app.delete("/api/checklists/:id", authenticate, async (req, res) => {
    try {
      await storage.deleteChecklist(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete checklist" });
    }
  });

  app.get("/api/folders/:folderId/checklists", authenticate, async (req, res) => {
    try {
      const checklists = await storage.getChecklistsByFolder(req.params.folderId);
      res.json(checklists);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch checklists" });
    }
  });

  app.get("/api/projects/:projectId/checklists", authenticate, async (req, res) => {
    try {
      const checklists = await storage.getChecklistsByProject(req.params.projectId);
      res.json(checklists);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch checklists" });
    }
  });

  // ==================== SMART NOTE ROUTES ====================
  
  app.get("/api/smart-notes", authenticate, async (req: any, res) => {
    try {
      const smartNotes = await storage.getSmartNotesByUser(req.userId);
      res.json(smartNotes);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch smart notes" });
    }
  });

  app.get("/api/smart-notes/:id", authenticate, async (req, res) => {
    try {
      const smartNote = await storage.getSmartNote(req.params.id);
      if (!smartNote) {
        return res.status(404).json({ message: "Smart note not found" });
      }
      res.json(smartNote);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch smart note" });
    }
  });

  app.post("/api/smart-notes", authenticate, async (req: any, res) => {
    try {
      const smartNote = await storage.createSmartNote({ ...req.body, userId: req.userId });
      res.status(201).json(smartNote);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to create smart note" });
    }
  });

  app.patch("/api/smart-notes/:id", authenticate, async (req, res) => {
    try {
      const smartNote = await storage.updateSmartNote(req.params.id, req.body);
      if (!smartNote) {
        return res.status(404).json({ message: "Smart note not found" });
      }
      res.json(smartNote);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update smart note" });
    }
  });

  app.delete("/api/smart-notes/:id", authenticate, async (req, res) => {
    try {
      await storage.deleteSmartNote(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete smart note" });
    }
  });

  app.get("/api/folders/:folderId/smart-notes", authenticate, async (req, res) => {
    try {
      const smartNotes = await storage.getSmartNotesByFolder(req.params.folderId);
      res.json(smartNotes);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch smart notes" });
    }
  });

  app.get("/api/projects/:projectId/smart-notes", authenticate, async (req, res) => {
    try {
      const smartNotes = await storage.getSmartNotesByProject(req.params.projectId);
      res.json(smartNotes);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch smart notes" });
    }
  });

  // ==================== PROJECT ROUTES ====================
  
  app.get("/api/projects", authenticate, async (req: any, res) => {
    try {
      const projects = await storage.getProjectsByUser(req.userId);
      res.json(projects);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", authenticate, async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch project" });
    }
  });

  app.get("/api/projects/:id/stats", authenticate, async (req: any, res) => {
    try {
      const projectId = req.params.id;
      
      // Get all items for the user
      const snippets = await storage.getSnippetsByUser(req.userId);
      const notes = await storage.getNotesByUser(req.userId);
      const checklists = await storage.getChecklistsByUser(req.userId);
      const smartNotes = await storage.getSmartNotesByUser(req.userId);
      
      // Count items belonging to this project
      const snippetCount = snippets.filter(s => s.projectId === projectId).length;
      const noteCount = notes.filter(n => n.projectId === projectId).length;
      const checklistCount = checklists.filter(c => c.projectId === projectId).length;
      const smartNoteCount = smartNotes.filter(sn => sn.projectId === projectId).length;
      
      res.json({
        snippets: snippetCount,
        notes: noteCount,
        checklists: checklistCount,
        smartNotes: smartNoteCount,
        total: snippetCount + noteCount + checklistCount + smartNoteCount
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch project stats" });
    }
  });

  app.post("/api/projects", authenticate, async (req: any, res) => {
    try {
      const project = await storage.createProject({ ...req.body, userId: req.userId });
      res.status(201).json(project);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to create project" });
    }
  });

  app.patch("/api/projects/:id", authenticate, async (req, res) => {
    try {
      const project = await storage.updateProject(req.params.id, req.body);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", authenticate, async (req, res) => {
    try {
      await storage.deleteProject(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete project" });
    }
  });

  // ==================== FOLDER ROUTES ====================
  
  app.get("/api/folders", authenticate, async (req: any, res) => {
    try {
      const folders = await storage.getFoldersByUser(req.userId);
      res.json(folders);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch folders" });
    }
  });

  app.get("/api/folders/:id", authenticate, async (req, res) => {
    try {
      const folder = await storage.getFolder(req.params.id);
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }
      res.json(folder);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch folder" });
    }
  });

  app.post("/api/folders", authenticate, async (req: any, res) => {
    try {
      const folder = await storage.createFolder({ ...req.body, userId: req.userId });
      res.status(201).json(folder);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to create folder" });
    }
  });

  app.delete("/api/folders/:id", authenticate, async (req, res) => {
    try {
      await storage.deleteFolder(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete folder" });
    }
  });

  // ==================== TAG ROUTES ====================
  
  app.get("/api/tags", authenticate, async (req: any, res) => {
    try {
      const tags = await storage.getTagsByUser(req.userId);
      res.json(tags);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch tags" });
    }
  });

  app.post("/api/tags", authenticate, async (req: any, res) => {
    try {
      const tag = await storage.createTag({ ...req.body, userId: req.userId });
      res.status(201).json(tag);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to create tag" });
    }
  });

  app.delete("/api/tags/:id", authenticate, async (req, res) => {
    try {
      await storage.deleteTag(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete tag" });
    }
  });

  // ==================== PREMIUM REQUEST ROUTES ====================
  
  app.get("/api/premium-requests", authenticate, async (req: any, res) => {
    try {
      // Check if user is admin
      const user = await storage.getUser(req.userId);
      if (!user?.isAdmin) {
        // Non-admins can only see their own requests
        const requests = await storage.getPremiumRequestsByUser(req.userId);
        return res.json(requests);
      }
      
      // Admins can see all requests
      const requests = await storage.getAllPremiumRequests();
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch premium requests" });
    }
  });

  app.post("/api/premium-requests", authenticate, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const request = await storage.createPremiumRequest({
        ...req.body,
        userId: req.userId,
        userEmail: user.email,
      });
      res.status(201).json(request);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to create premium request" });
    }
  });

  app.patch("/api/premium-requests/:id", authenticate, async (req: any, res) => {
    try {
      // Only admins can update premium requests
      const user = await storage.getUser(req.userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const request = await storage.updatePremiumRequest(req.params.id, req.body);
      if (!request) {
        return res.status(404).json({ message: "Premium request not found" });
      }
      res.json(request);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update premium request" });
    }
  });

  app.delete("/api/premium-requests/:id", authenticate, async (req: any, res) => {
    try {
      // Only admins can delete premium requests
      const user = await storage.getUser(req.userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deletePremiumRequest(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete premium request" });
    }
  });

  // ==================== SEARCH ROUTES ====================
  
  app.get("/api/search", authenticate, async (req: any, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const [snippets, notes, checklists, smartNotes] = await Promise.all([
        storage.searchSnippets(req.userId, q),
        storage.searchNotes(req.userId, q),
        storage.searchChecklists(req.userId, q),
        storage.searchSmartNotes(req.userId, q),
      ]);
      
      res.json({ snippets, notes, checklists, smartNotes });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to search" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
