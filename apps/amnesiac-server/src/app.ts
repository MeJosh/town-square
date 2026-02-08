import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { setupSwagger } from './config/swagger.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      fontSrc: ["'self'", "https:", "data:", "http:"],
      connectSrc: ["'self'", "http:", "https:"],
      // Explicitly disable upgrade-insecure-requests for HTTP-only server
      upgradeInsecureRequests: null,
    },
  },
  // Disable HSTS to prevent HTTPS upgrade for development/HTTP-only servers
  hsts: false,
})); // Security headers with Swagger UI compatibility
app.use(morgan('combined')); // Request logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies// Routes
app.use(routes);

// Setup Swagger documentation
setupSwagger(app);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Amnesiac Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🎲 API endpoints: http://localhost:${PORT}/api/sessions`);
});

export default app;
