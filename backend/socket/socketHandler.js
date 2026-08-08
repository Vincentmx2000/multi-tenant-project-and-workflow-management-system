const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const User = require('../models/User');

let io;

const initSocketHandler = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Not authorized'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('Not authorized'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Not authorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(socket.user.companyId.toString());
  });
};

const emitTaskUpdate = (companyId, data) => {
  if (io) {
    io.to(companyId.toString()).emit('taskUpdated', data);
  }
};

const emitNewNotification = (companyId, data) => {
  if (io) {
    io.to(companyId.toString()).emit('newNotification', data);
  }
};

module.exports = { initSocketHandler, emitTaskUpdate, emitNewNotification };
