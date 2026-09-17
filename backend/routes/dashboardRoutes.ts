import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import { getStats } from '../controllers/dashboardController';
import { AuthenticatedRequest } from '../types';

const router = Router();

router.use(authMiddleware as any);

router.get('/stats', (req, res) => getStats(req as AuthenticatedRequest, res));

export default router;
