import { Request } from 'express';
import { ParamsDictionary, Query } from 'express-serve-static-core';
import { Types } from 'mongoose';

// ─── ROLES ───────────────────────────────────────────────────────────────────
export type Role = 'Owner' | 'Admin' | 'Manager' | 'Member';

export const ROLES: readonly Role[] = ['Owner', 'Admin', 'Manager', 'Member'] as const;

// ─── USER PAYLOAD & AUTHENTICATED REQUEST ────────────────────────────────────
/**
 * Safe user payload attached to `req.user` after JWT verification in authMiddleware.
 * Notice: `companyId` is strictly non-nullable Types.ObjectId.
 */
export interface IUserPayload {
  _id: Types.ObjectId;
  name: string;
  email: string;
  companyId: Types.ObjectId;
  role: Role;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Enforces verified JWT user presence and tenant scoping via `req.user.companyId`.
 * Every protected controller handler and service MUST use this request interface.
 */
export interface AuthenticatedRequest<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = Query,
  Locals extends Record<string, any> = Record<string, any>
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
  user: IUserPayload;
}

// Global Express type extension for optional user in untyped middleware chains
declare global {
  namespace Express {
    interface Request {
      user?: IUserPayload;
    }
  }
}

// ─── DOMAIN ENTITY INTERFACES ────────────────────────────────────────────────
export interface ICompany {
  _id: Types.ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  companyId: Types.ObjectId;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProject {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  status?: string;
  deadline?: Date;
  companyId: Types.ObjectId;
  members: Types.ObjectId[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface ITask {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  priority?: TaskPriority | string;
  status?: TaskStatus | string;
  dueDate?: Date;
  labels: string[];
  companyId: Types.ObjectId;
  projectId: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IComment {
  _id: Types.ObjectId;
  text: string;
  taskId: Types.ObjectId;
  userId: Types.ObjectId;
  companyId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IActivityLog {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  projectId?: Types.ObjectId;
  userId: Types.ObjectId;
  action: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotification {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  userId: Types.ObjectId;
  message: string;
  type: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── PAGINATION & COMMON API DTOs ────────────────────────────────────────────
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AuthResponse {
  token: string;
  user: {
    _id: Types.ObjectId;
    name: string;
    email: string;
    companyId: Types.ObjectId;
    companyName: string;
    role: Role;
    createdAt?: Date;
    updatedAt?: Date;
  };
}
