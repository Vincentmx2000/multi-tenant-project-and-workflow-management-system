import { Router, Request, Response } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import { checkRole } from '../middleware/roleMiddleware';
import validate from '../middleware/validateMiddleware';
import { createRules, updateRules } from '../validators/taskValidators';
import {
  create,
  getAll,
  getOne,
  update,
  updateStatus,
  assign,
  remove,
} from '../controllers/taskController';
import { AuthenticatedRequest } from '../types';

const router = Router();

router.use(authMiddleware as any);

router.post(
  '/',
  checkRole(['Owner', 'Admin', 'Manager']) as any,
  createRules,
  validate as any,
  (req: Request, res: Response) => create(req as AuthenticatedRequest, res)
);

router.get('/', (req: Request, res: Response) => getAll(req as AuthenticatedRequest, res));

router.patch('/:id/status', (req: Request, res: Response) =>
  updateStatus(req as unknown as AuthenticatedRequest<{ id: string }>, res)
);

router.patch(
  '/:id/assign',
  checkRole(['Owner', 'Admin', 'Manager']) as any,
  (req: Request, res: Response) => assign(req as unknown as AuthenticatedRequest<{ id: string }>, res)
);

router.get('/:id', (req: Request, res: Response) =>
  getOne(req as unknown as AuthenticatedRequest<{ id: string }>, res)
);

router.put(
  '/:id',
  checkRole(['Owner', 'Admin', 'Manager']) as any,
  updateRules,
  validate as any,
  (req: Request, res: Response) => update(req as unknown as AuthenticatedRequest<{ id: string }>, res)
);

router.delete(
  '/:id',
  checkRole(['Owner', 'Admin', 'Manager']) as any,
  (req: Request, res: Response) => remove(req as unknown as AuthenticatedRequest<{ id: string }>, res)
);

export default router;
