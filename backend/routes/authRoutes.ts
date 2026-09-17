import { Router, Request, Response } from 'express';
import { register, login } from '../controllers/authController';
import { registerRules, loginRules } from '../validators/authValidators';
import validate from '../middleware/validateMiddleware';

const router = Router();

router.post('/register', registerRules, validate as any, (req: Request, res: Response) => register(req, res));
router.post('/login', loginRules, validate as any, (req: Request, res: Response) => login(req, res));

export default router;
