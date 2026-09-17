import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import {
  getMine,
  markRead,
  markAllRead,
} from '../controllers/notificationController';
import { AuthenticatedRequest } from '../types';

const router = Router();

router.use(authMiddleware as any);

router.get('/', (req, res) => getMine(req as AuthenticatedRequest, res));
router.patch('/:id/read', (req, res) => markRead(req as unknown as AuthenticatedRequest<{ id: string }>, res));
router.patch('/read-all', (req, res) => markAllRead(req as AuthenticatedRequest, res));

export default router;
