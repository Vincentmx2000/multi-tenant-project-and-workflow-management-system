import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import { checkRole } from '../middleware/roleMiddleware';
import {
  getCompanyMe,
  getCompanyUsers,
  updateUserRole,
} from '../controllers/companyController';
import { AuthenticatedRequest } from '../types';

const router = Router();

router.use(authMiddleware as any);

router.get('/me', (req, res) => getCompanyMe(req as AuthenticatedRequest, res));
router.get('/users', (req, res) => getCompanyUsers(req as AuthenticatedRequest, res));
router.patch('/users/:userId/role', checkRole(['Owner']) as any, (req, res) =>
  updateUserRole(req as unknown as AuthenticatedRequest<{ userId: string }, any, { role?: string }>, res)
);

export default router;
