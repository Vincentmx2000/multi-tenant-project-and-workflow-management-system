const Comment = require('../models/Comment');
const Task = require('../models/Task');
const { emitTaskUpdate } = require('../socket/socketHandler');
const add = async (req, res) => {
  try {
    const { text, taskId } = req.body;

    if (!text || !taskId) {
      return res.status(400).json({ message: 'Text and taskId are required' });
    }

    const task = await Task.findOne({
      _id: taskId,
      companyId: req.user.companyId,
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const comment = await Comment.create({
      text,
      taskId,
      userId: req.user._id,
      companyId: req.user.companyId,
    });

    emitTaskUpdate(req.user.companyId, { comment, taskId });

    res.status(201).json(comment);  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getByTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findOne({
      _id: taskId,
      companyId: req.user.companyId,
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const comments = await Comment.find({
      taskId,
      companyId: req.user.companyId,
    }).sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const comment = await Comment.findOne({
      _id: req.params.id,
      companyId: req.user.companyId,
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const isAuthor = comment.userId.toString() === req.user._id.toString();
    const isOwnerOrAdmin = ['Owner', 'Admin'].includes(req.user.role);

    if (!isAuthor && !isOwnerOrAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await comment.deleteOne();

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { add, getByTask, remove };
