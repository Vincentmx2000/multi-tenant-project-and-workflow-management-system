import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import { getByProject } from '../controllers/activityController';
import { AuthenticatedRequest } from '../types';

const router = Router();

router.use(authMiddleware as any);

router.get('/project/:projectId', (req, res) => getByProject(req as unknown as AuthenticatedRequest<{ projectId?: string }>, res));
router.get('/', (req, res) => getByProject(req as unknown as AuthenticatedRequest<{ projectId?: string }>, res));

export default router;
