import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/User';
import { IUserPayload } from '../types';

interface DecodedToken extends JwtPayload {
  id: string;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'Server authentication configuration error' });
    }

    const decoded = jwt.verify(token, secret) as DecodedToken;
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const userDoc = await User.findById(decoded.id).select('-password');

    if (!userDoc) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Attach verified user with strictly non-nullable companyId
    req.user = {
      _id: userDoc._id,
      name: userDoc.name,
      email: userDoc.email,
      companyId: userDoc.companyId,
      role: userDoc.role,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
    } as IUserPayload;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized' });
  }
};

export default authMiddleware;
