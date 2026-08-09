const ActivityLog = require('../models/ActivityLog');

/**
 * Get activity logs for a specific project.
 * Multi-tenant safe: filters by companyId and projectId.
 */
const getByProject = async (req, res) => {
  try {
    const projectId = req.params.projectId || req.query.projectId;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const skip = (page - 1) * limit;

    const filter = {
      companyId: req.user.companyId,
      projectId,
    };

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
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getByProject };
