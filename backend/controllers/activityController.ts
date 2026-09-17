import { Response } from 'express';
import { FilterQuery } from 'mongoose';
import ActivityLog, { IActivityLogDocument } from '../models/ActivityLog';
import { AuthenticatedRequest } from '../types';

export const getByProject = async (
  req: AuthenticatedRequest<{ projectId?: string }>,
  res: Response
): Promise<void | Response> => {
  try {
    const projectId = req.params.projectId || (req.query.projectId as string | undefined);
    const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit as string, 10) || 10, 1);
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IActivityLogDocument> = {
      companyId: req.user.companyId,
    };

    if (projectId) {
      filter.projectId = projectId as any;
    }

    const [data, total] = await Promise.all([
      ActivityLog.find(filter)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ActivityLog.countDocuments(filter),
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

export default { getByProject };
