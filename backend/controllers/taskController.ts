import { Response } from 'express';
import { FilterQuery, Types } from 'mongoose';
import Task, { ITaskDocument } from '../models/Task';
import Project from '../models/Project';
import User from '../models/User';
import createNotification from '../utils/createNotification';
import logActivity from '../utils/logActivity';
import { emitTaskUpdate, emitNewNotification } from '../socket/socketHandler';
import { AuthenticatedRequest } from '../types';

// Helper: safely create + emit one notification; never crashes the caller
const safeNotify = async (
  companyId: string | Types.ObjectId,
  userId: string | Types.ObjectId,
  message: string,
  type: string,
  label: string
): Promise<void> => {
  if (!companyId) {
    console.error(`[notify:${label}] SKIPPED — companyId is undefined`);
    return;
  }
  if (!userId) {
    console.error(`[notify:${label}] SKIPPED — userId is undefined`);
    return;
  }
  try {
    const notification = await createNotification({ companyId, userId, message, type });
    console.log(`[notify:${label}] Saved notification _id=${notification._id} userId=${userId} msg="${message}"`);
    emitNewNotification(companyId, notification);
  } catch (err) {
    const error = err as Error;
    console.error(`[notify:${label}] createNotification FAILED:`, error.message, error);
  }
};

// ─── CREATE ──────────────────────────────────────────────────────────────────
export const create = async (req: AuthenticatedRequest, res: Response): Promise<void | Response> => {
  try {
    const {
      title,
      description,
      priority,
      status,
      dueDate,
      labels,
      projectId,
      assignedTo,
    } = req.body;

    const project = await Project.findOne({
      _id: projectId,
      companyId: req.user.companyId,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = await Task.create({
      title,
      description,
      priority,
      status,
      dueDate,
      labels,
      projectId,
      assignedTo,
      companyId: req.user.companyId,
      createdBy: req.user._id,
    });

    // Notify every company member — assigned user gets a personalised message
    const companyUsers = await User.find({ companyId: req.user.companyId });
    console.log(`[notify:create] Notifying ${companyUsers.length} company members for task "${task.title}"`);

    for (const member of companyUsers) {
      const isAssigned = assignedTo && member._id.toString() === assignedTo.toString();
      const message = isAssigned
        ? `You have been assigned to task: "${task.title}"`
        : `New task created: "${task.title}" in project "${project.title}"`;

      await safeNotify(
        req.user.companyId,
        member._id,
        message,
        isAssigned ? 'assignment' : 'status_change',
        'create'
      );
    }

    emitTaskUpdate(req.user.companyId, task);

    await logActivity({
      companyId: req.user.companyId,
      projectId: task.projectId,
      userId: req.user._id,
      action: `Task created: ${task.title}`,
    });

    res.status(201).json(task);
  } catch (error) {
    const err = error as Error;
    console.error('Task create error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ─── GET ALL ─────────────────────────────────────────────────────────────────
export const getAll = async (req: AuthenticatedRequest, res: Response): Promise<void | Response> => {
  try {
    const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit as string, 10) || 10, 1);
    const skip = (page - 1) * limit;

    const filter: FilterQuery<ITaskDocument> = { companyId: req.user.companyId };

    if (req.query.status) filter.status = req.query.status as string;
    if (req.query.priority) filter.priority = req.query.priority as string;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo as any;
    if (req.query.projectId) filter.projectId = req.query.projectId as any;

    const [data, total] = await Promise.all([
      Task.find(filter).skip(skip).limit(limit),
      Task.countDocuments(filter),
    ]);

    res.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    const err = error as Error;
    console.error('Task getAll error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ─── GET ONE ─────────────────────────────────────────────────────────────────
export const getOne = async (req: AuthenticatedRequest<{ id: string }>, res: Response): Promise<void | Response> => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      companyId: req.user.companyId,
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    const err = error as Error;
    console.error('Task getOne error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ─── UPDATE (full edit) ───────────────────────────────────────────────────────
export const update = async (req: AuthenticatedRequest<{ id: string }>, res: Response): Promise<void | Response> => {
  try {
    const {
      title,
      description,
      priority,
      status,
      dueDate,
      labels,
      projectId,
      assignedTo,
    } = req.body;

    if (projectId) {
      const project = await Project.findOne({
        _id: projectId,
        companyId: req.user.companyId,
      });

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
    }

    const existingTask = await Task.findOne({
      _id: req.params.id,
      companyId: req.user.companyId,
    });

    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      { title, description, priority, status, dueDate, labels, projectId, assignedTo },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Notify the newly-assigned user if assignment changed
    if (assignedTo && assignedTo.toString() !== existingTask.assignedTo?.toString()) {
      await safeNotify(
        req.user.companyId,
        assignedTo,
        `You have been assigned to task: "${task.title}"`,
        'assignment',
        'update:assign'
      );
    }

    emitTaskUpdate(req.user.companyId, task);

    res.json(task);
  } catch (error) {
    const err = error as Error;
    console.error('Task update error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ─── UPDATE STATUS (drag-and-drop) ───────────────────────────────────────────
export const updateStatus = async (req: AuthenticatedRequest<{ id: string }>, res: Response): Promise<void | Response> => {
  try {
    const { status } = req.body;

    const existingTask = await Task.findOne({
      _id: req.params.id,
      companyId: req.user.companyId,
    });

    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      { status },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only notify if a user is actually assigned
    if (existingTask.assignedTo) {
      await safeNotify(
        req.user.companyId,
        existingTask.assignedTo,
        `Task "${task.title}" status updated to "${status}"`,
        'status_change',
        'updateStatus'
      );
    }

    emitTaskUpdate(req.user.companyId, task);

    await logActivity({
      companyId: req.user.companyId,
      projectId: task.projectId,
      userId: req.user._id,
      action: `Task "${task.title}" status updated to ${status}`,
    });

    res.json(task);
  } catch (error) {
    const err = error as Error;
    console.error('Task updateStatus error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ─── ASSIGN ──────────────────────────────────────────────────────────────────
export const assign = async (req: AuthenticatedRequest<{ id: string }>, res: Response): Promise<void | Response> => {
  try {
    const { assignedTo } = req.body;

    const existingTask = await Task.findOne({
      _id: req.params.id,
      companyId: req.user.companyId,
    });

    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      { assignedTo },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only notify if a recipient was actually provided
    if (assignedTo) {
      await safeNotify(
        req.user.companyId,
        assignedTo,
        `You have been assigned to task: "${task.title}"`,
        'assignment',
        'assign'
      );
    }

    emitTaskUpdate(req.user.companyId, task);

    await logActivity({
      companyId: req.user.companyId,
      projectId: task.projectId,
      userId: req.user._id,
      action: `Task "${task.title}" assigned`,
    });

    res.json(task);
  } catch (error) {
    const err = error as Error;
    console.error('Task assign error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ─── REMOVE ──────────────────────────────────────────────────────────────────
export const remove = async (req: AuthenticatedRequest<{ id: string }>, res: Response): Promise<void | Response> => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      companyId: req.user.companyId,
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted' });
  } catch (error) {
    const err = error as Error;
    console.error('Task remove error:', err);
    res.status(500).json({ message: err.message });
  }
};

export default { create, getAll, getOne, update, updateStatus, assign, remove };
