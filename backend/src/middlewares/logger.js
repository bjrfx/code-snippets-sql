/**
 * Custom request logger middleware
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, path } = req;

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    
    // Only log API routes
    if (path.startsWith('/api')) {
      const timestamp = new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      
      // Color code based on status
      const statusColor = statusCode >= 500 ? '🔴' : 
                         statusCode >= 400 ? '🟡' : 
                         statusCode >= 300 ? '🔵' : '🟢';
      
      console.log(
        `${timestamp} ${statusColor} ${method} ${path} ${statusCode} - ${duration}ms`
      );
    }
  });

  next();
};

/**
 * Log errors
 */
export const errorLogger = (err, req, res, next) => {
  console.error('❌ Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  next(err);
};

export default { requestLogger, errorLogger };
