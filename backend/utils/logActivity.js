const ActivityLog = require('../models/ActivityLog');

/**
 * Log activity for a company / project / user action.
 * @param {Object} params
 * @param {string|ObjectId} params.companyId
 * @param {string|ObjectId} [params.projectId]
 * @param {string|ObjectId} params.userId
 * @param {string} params.action
 */
const logActivity = async ({ companyId, projectId, userId, action }) => {
  try {
    return await ActivityLog.create({
      companyId,
      projectId,
      userId,
      action,
    });
  } catch (error) {
    console.error('Failed to create activity log:', error);
  }
};

module.exports = logActivity;
