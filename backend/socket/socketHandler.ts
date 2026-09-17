import http from 'http';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { Types } from 'mongoose';
import User from '../models/User';
import { IUserPayload } from '../types';

export interface AuthenticatedSocket extends Socket {
  user: IUserPayload;
}

let io: Server | undefined;

export const initSocketHandler = (server: http.Server): Server => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('Not authorized'));
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return next(new Error('JWT_SECRET is not configured'));
      }

      const decoded = jwt.verify(token, secret) as JwtPayload & { id: string };
      if (!decoded || !decoded.id) {
        return next(new Error('Not authorized'));
      }

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Not authorized'));
      }

      (socket as AuthenticatedSocket).user = {
        _id: user._id,
        name: user.name,
        email: user.email,
        companyId: user.companyId,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      next();
    } catch (error) {
      next(new Error('Not authorized'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    if (authSocket.user && authSocket.user.companyId) {
      authSocket.join(authSocket.user.companyId.toString());
    }
  });

  return io;
};

export const emitTaskUpdate = (companyId: string | Types.ObjectId, data: unknown): void => {
  if (io) {
    io.to(companyId.toString()).emit('taskUpdated', data);
  }
};

export const emitNewNotification = (companyId: string | Types.ObjectId, data: unknown): void => {
  if (io) {
    io.to(companyId.toString()).emit('newNotification', data);
  }
};

export default { initSocketHandler, emitTaskUpdate, emitNewNotification };
