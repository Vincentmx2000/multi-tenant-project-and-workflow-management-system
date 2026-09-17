import { Request, Response, NextFunction } from 'express';
import { Role } from '../types';

export const checkRole = (allowedRoles: (Role | string)[]) => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const userRoleLower = req.user.role.toLowerCase();
    const allowedRolesLower = allowedRoles.map((r) => r.toLowerCase());

    if (!allowedRolesLower.includes(userRoleLower)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};

export default { checkRole };
