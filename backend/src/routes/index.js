import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import snippetRoutes from './snippet.routes.js';
import noteRoutes from './note.routes.js';
import projectRoutes from './project.routes.js';
import folderRoutes from './folder.routes.js';
import searchRoutes from './search.routes.js';

const router = express.Router();

/**
 * API Routes
 */

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/snippets', snippetRoutes);
router.use('/notes', noteRoutes);
router.use('/projects', projectRoutes);
router.use('/folders', folderRoutes);
router.use('/search', searchRoutes);

export default router;
