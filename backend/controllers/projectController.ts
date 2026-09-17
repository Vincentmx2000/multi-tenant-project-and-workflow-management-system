import { Response } from 'express';
import Project from '../models/Project';
import logActivity from '../utils/logActivity';
import { AuthenticatedRequest } from '../types';

export const create = async (req: AuthenticatedRequest, res: Response): Promise<void | Response> => {
  try {
    const { title, description, status, deadline, members } = req.body;

    const project = await Project.create({
      title,
      description,
      status,
      deadline,
      members,
      companyId: req.user.companyId,
      createdBy: req.user._id,
    });

    await logActivity({
      companyId: req.user.companyId,
      projectId: project._id,
      userId: req.user._id,
      action: `Project created: ${project.title}`,
    });

    res.status(201).json(project);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
  }
};

export const getAll = async (req: AuthenticatedRequest, res: Response): Promise<void | Response> => {
  try {
    const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit as string, 10) || 10, 1);
    const skip = (page - 1) * limit;

    const filter = { companyId: req.user.companyId };

    const [data, total] = await Promise.all([
      Project.find(filter).skip(skip).limit(limit),
      Project.countDocuments(filter),
    ]);

    res.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
  }
};

export const getOne = async (req: AuthenticatedRequest<{ id: string }>, res: Response): Promise<void | Response> => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      companyId: req.user.companyId,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
  }
};

export const update = async (req: AuthenticatedRequest<{ id: string }>, res: Response): Promise<void | Response> => {
  try {
    const { title, description, status, deadline, members } = req.body;

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      { title, description, status, deadline, members },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await logActivity({
      companyId: req.user.companyId,
      projectId: project._id,
      userId: req.user._id,
      action: `Project updated: ${project.title}`,
    });

    res.json(project);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
  }
};

export const remove = async (req: AuthenticatedRequest<{ id: string }>, res: Response): Promise<void | Response> => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      companyId: req.user.companyId,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await logActivity({
      companyId: req.user.companyId,
      projectId: project._id,
      userId: req.user._id,
      action: `Project deleted: ${project.title}`,
    });

    res.json({ message: 'Project deleted' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
  }
};

export default { create, getAll, getOne, update, remove };
