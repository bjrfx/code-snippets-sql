import { mysqlTable, varchar, text, int, bigint, boolean, json, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// MySQL Tables
export const users = mysqlTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  role: varchar("role", { length: 50 }).notNull().default("free"),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  settings: json("settings").$type<{ theme?: string; fontSize?: number }>().notNull().default({ theme: "light", fontSize: 14 }),
  displayName: varchar("display_name", { length: 255 }),
  photoURL: text("photo_url"),
});

export const snippets = mysqlTable("snippets", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  language: varchar("language", { length: 100 }).notNull(),
  description: text("description"),
  tags: json("tags").$type<string[]>().notNull().default([]),
  folderId: varchar("folder_id", { length: 255 }),
  projectId: varchar("project_id", { length: 255 }),
  userId: varchar("user_id", { length: 255 }).notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});

export const notes = mysqlTable("notes", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  tags: json("tags").$type<string[]>().notNull().default([]),
  folderId: varchar("folder_id", { length: 255 }),
  projectId: varchar("project_id", { length: 255 }),
  userId: varchar("user_id", { length: 255 }).notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});

export const checklists = mysqlTable("checklists", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  items: json("items").$type<Array<{ id: string; text: string; completed: boolean }>>().notNull().default([]),
  tags: json("tags").$type<string[]>().notNull().default([]),
  folderId: varchar("folder_id", { length: 255 }),
  projectId: varchar("project_id", { length: 255 }),
  userId: varchar("user_id", { length: 255 }).notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});

export const smartNotes = mysqlTable("smart_notes", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(), // Rich text HTML content
  tags: json("tags").$type<string[]>().notNull().default([]),
  folderId: varchar("folder_id", { length: 255 }),
  projectId: varchar("project_id", { length: 255 }),
  userId: varchar("user_id", { length: 255 }).notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});

export const projects = mysqlTable("projects", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  userId: varchar("user_id", { length: 255 }).notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});

export const folders = mysqlTable("folders", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const tags = mysqlTable("tags", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  userId: varchar("user_id", { length: 255 }).notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});

export const premiumRequests = mysqlTable("premium_requests", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  userEmail: varchar("user_email", { length: 255 }).notNull(),
  reason: text("reason").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

// Zod schemas
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  isAdmin: z.boolean().optional().default(false),
  role: z.string().optional().default("free"),
  createdAt: z.number(),
  settings: z.object({
    theme: z.string().optional(),
    fontSize: z.number().optional(),
  }).optional(),
  displayName: z.string().optional(),
  photoURL: z.string().optional(),
});

export const snippetSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  content: z.string(),
  language: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()),
  folderId: z.string().optional(),
  projectId: z.string().optional(),
  userId: z.string(),
  createdAt: z.number(),
  updatedAt: z.number()
});

export const noteSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  content: z.string(),
  tags: z.array(z.string()),
  folderId: z.string().optional(),
  projectId: z.string().optional(),
  userId: z.string(),
  createdAt: z.number(),
  updatedAt: z.number()
});

export const checklistSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  items: z.array(z.object({
    id: z.string(),
    text: z.string(),
    completed: z.boolean()
  })),
  tags: z.array(z.string()),
  folderId: z.string().optional(),
  projectId: z.string().optional(),
  userId: z.string(),
  createdAt: z.number(),
  updatedAt: z.number()
});

export const smartNoteSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  content: z.string(), // Rich text HTML content
  tags: z.array(z.string()),
  folderId: z.string().optional(),
  projectId: z.string().optional(),
  userId: z.string(),
  createdAt: z.number(),
  updatedAt: z.number()
});

export const projectSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  userId: z.string(),
  createdAt: z.number(),
  updatedAt: z.number()
});

export const folderSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  userId: z.string(),
  createdAt: z.number()
});

export const tagSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  userId: z.string()
});

export const premiumRequestSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userEmail: z.string().email(),
  reason: z.string(),
  status: z.string().default("pending"),
  createdAt: z.number(),
});

// Types
export type User = z.infer<typeof userSchema>;
export type InsertUser = Omit<User, 'id' | 'createdAt'>;
export type Snippet = z.infer<typeof snippetSchema>;
export type Note = z.infer<typeof noteSchema>;
export type Checklist = z.infer<typeof checklistSchema>;
export type SmartNote = z.infer<typeof smartNoteSchema>;
export type Folder = z.infer<typeof folderSchema>;
export type Tag = z.infer<typeof tagSchema>;
export type Project = z.infer<typeof projectSchema>;
export type PremiumRequest = z.infer<typeof premiumRequestSchema>;