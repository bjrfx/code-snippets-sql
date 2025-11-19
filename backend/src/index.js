import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import { testConnection } from './config/database.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import { requestLogger } from './middlewares/logger.js';

/**
 * Initialize Express App
 */
const app = express();

/**
 * Security Middleware
 */
// Helmet helps secure Express apps by setting HTTP response headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindow,
  max: config.rateLimitMax,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

/**
 * Body Parser Middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Logging Middleware
 */
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}
app.use(requestLogger);

/**
 * API Routes
 */
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Code Snippets API Server',
    version: '2.0.0',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

/**
 * Error Handling
 */
app.use(notFound);
app.use(errorHandler);

/**
 * Start Server
 */
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Start listening
    app.listen(config.port, () => {
      console.log('');
      console.log('🚀 ================================== 🚀');
      console.log(`   Server is running on port ${config.port}`);
      console.log(`   Environment: ${config.nodeEnv}`);
      console.log(`   API URL: http://localhost:${config.port}/api`);
      console.log('🚀 ================================== 🚀');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Start the server
startServer();

export default app;
