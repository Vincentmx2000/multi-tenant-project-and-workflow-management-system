const Notification = require('../models/Notification');

const createNotification = async ({ companyId, userId, message, type }) => {
  return Notification.create({ companyId, userId, message, type });
};

module.exports = createNotification;
