import { Router } from 'express';
import sessionRoutes from './sessions.js';

const router = Router();

router.use('/api', sessionRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the current status of the API server
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Amnesiac Server is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
