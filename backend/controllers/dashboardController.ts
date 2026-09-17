import { Response } from 'express';
import mongoose from 'mongoose';
import Task from '../models/Task';
import Project from '../models/Project';
import { AuthenticatedRequest } from '../types';

export const getStats = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> => {
  try {
    const companyId = new mongoose.Types.ObjectId(req.user.companyId);
    const now = new Date();

    const [taskStats, projectStats] = await Promise.all([
      Task.aggregate([
        { $match: { companyId } },
        {
          $facet: {
            totalTasks: [{ $count: 'count' }],
            tasksByStatus: [
              { $group: { _id: '$status', count: { $sum: 1 } } }
            ],
            overdueTasks: [
              {
                $match: {
                  dueDate: { $lt: now },
                  status: { $ne: 'done' }
                }
              },
              { $count: 'count' }
            ]
          }
        }
      ]),
      Project.aggregate([
        { $match: { companyId } },
        { $count: 'count' }
      ])
    ]);

    const totalProjects = projectStats[0]?.count || 0;
    const totalTasks = taskStats[0]?.totalTasks[0]?.count || 0;
    const overdueTasks = taskStats[0]?.overdueTasks[0]?.count || 0;

    const tasksByStatus = (taskStats[0]?.tasksByStatus || []).reduce(
      (acc: Record<string, number>, curr: { _id: string; count: number }) => {
        if (curr._id) {
          acc[curr._id] = curr.count;
        }
        return acc;
      },
      {}
    );

    res.json({
      totalProjects,
      totalTasks,
      tasksByStatus,
      overdueTasks,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
  }
};

export default { getStats };
