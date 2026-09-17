import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import { add, getByTask, remove } from '../controllers/commentController';
import { AuthenticatedRequest } from '../types';

const router = Router();

router.use(authMiddleware as any);

router.post('/', (req, res) => add(req as AuthenticatedRequest, res));
router.get('/task/:taskId', (req, res) => getByTask(req as unknown as AuthenticatedRequest<{ taskId: string }>, res));
router.delete('/:id', (req, res) => remove(req as unknown as AuthenticatedRequest<{ id: string }>, res));

export default router;
