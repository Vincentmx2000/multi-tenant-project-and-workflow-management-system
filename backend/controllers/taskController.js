const Task = require('../models/Task');
const Project = require('../models/Project');
const createNotification = require('../utils/createNotification');
const logActivity = require('../utils/logActivity');
const { emitTaskUpdate, emitNewNotification } = require('../socket/socketHandler');

const create = async (req, res) => {
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

    if (
      assignedTo &&
      assignedTo.toString() !== req.user._id.toString()
    ) {
      const notification = await createNotification({
        companyId: req.user.companyId,
        userId: assignedTo,
        message: `You have been assigned to task: ${task.title}`,
        type: 'assignment',
      });
      emitNewNotification(req.user.companyId, notification);
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
    res.status(500).json({ message: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const skip = (page - 1) * limit;

    const filter = { companyId: req.user.companyId };

    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;

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
    res.status(500).json({ message: error.message });
  }
};

const getOne = async (req, res) => {
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
    res.status(500).json({ message: error.message });
  }
};

const update = async (req, res) => {
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
      {
        title,
        description,
        priority,
        status,
        dueDate,
        labels,
        projectId,
        assignedTo,
      },
      { new: true, runValidators: true }
    );

    if (
      assignedTo &&
      assignedTo.toString() !== existingTask.assignedTo?.toString() &&
      assignedTo.toString() !== req.user._id.toString()
    ) {
      const notification = await createNotification({
        companyId: req.user.companyId,
        userId: assignedTo,
        message: `You have been assigned to task: ${task.title}`,
        type: 'assignment',
      });
      emitNewNotification(req.user.companyId, notification);
    }

    emitTaskUpdate(req.user.companyId, task);

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStatus = async (req, res) => {
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

    if (
      existingTask.assignedTo &&
      existingTask.assignedTo.toString() !== req.user._id.toString()
    ) {
      const notification = await createNotification({
        companyId: req.user.companyId,
        userId: existingTask.assignedTo,
        message: `Task "${task.title}" status updated to ${status}`,
        type: 'status_change',
      });
      emitNewNotification(req.user.companyId, notification);
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
    res.status(500).json({ message: error.message });
  }
};

const assign = async (req, res) => {
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

    if (
      assignedTo &&
      assignedTo.toString() !== req.user._id.toString()
    ) {
      const notification = await createNotification({
        companyId: req.user.companyId,
        userId: assignedTo,
        message: `You have been assigned to task: ${task.title}`,
        type: 'assignment',
      });
      emitNewNotification(req.user.companyId, notification);
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
    res.status(500).json({ message: error.message });
  }
};

const remove = async (req, res) => {
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
    res.status(500).json({ message: error.message });
  }
};

module.exports = { create, getAll, getOne, update, updateStatus, assign, remove };
