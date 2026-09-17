import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

export const generateToken = (userId: string | Types.ObjectId): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  return jwt.sign({ id: userId.toString() }, secret, { expiresIn: '7d' });
};

export default generateToken;
