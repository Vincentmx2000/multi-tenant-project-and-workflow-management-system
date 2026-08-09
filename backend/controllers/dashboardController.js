const mongoose = require('mongoose');
const Task = require('../models/Task');
const Project = require('../models/Project');

/**
 * Get dashboard statistics for a company.
 * Uses Mongoose aggregation pipeline to compute task status grouping, overdue count,
 * total tasks, and total projects scoped to companyId.
 */
const getStats = async (req, res) => {
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

    const tasksByStatus = (taskStats[0]?.tasksByStatus || []).reduce((acc, curr) => {
      if (curr._id) {
        acc[curr._id] = curr.count;
      }
      return acc;
    }, {});

    res.json({
      totalProjects,
      totalTasks,
      tasksByStatus,
      overdueTasks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStats };
