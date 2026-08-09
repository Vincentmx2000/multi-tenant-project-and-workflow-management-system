const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const createNotification = require('../utils/createNotification');
const logActivity = require('../utils/logActivity');
const { emitTaskUpdate, emitNewNotification } = require('../socket/socketHandler');

// Helper: safely create + emit one notification; never crashes the caller
const safeNotify = async (companyId, userId, message, type, label) => {
  if (!companyId) {
    console.error(`[notify:${label}] SKIPPED — companyId is undefined`);
    return;
  }
  if (!userId) {
    console.error(`[notify:${label}] SKIPPED — userId is undefined`);
    return;
  }
  try {
    const notification = await createNotification({ companyId, userId, message, type });
    console.log(`[notify:${label}] Saved notification _id=${notification._id} userId=${userId} msg="${message}"`);
    emitNewNotification(companyId, notification);
  } catch (err) {
    console.error(`[notify:${label}] createNotification FAILED:`, err.message, err);
  }
};

// ─── CREATE ──────────────────────────────────────────────────────────────────
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

    // Notify every company member — assigned user gets a personalised message
    const companyUsers = await User.find({ companyId: req.user.companyId });
    console.log(`[notify:create] Notifying ${companyUsers.length} company members for task "${task.title}"`);

    for (const member of companyUsers) {
      const isAssigned = assignedTo && member._id.toString() === assignedTo.toString();
      const message = isAssigned
        ? `You have been assigned to task: "${task.title}"`
        : `New task created: "${task.title}" in project "${project.title}"`;

      await safeNotify(
        req.user.companyId,
        member._id,
        message,
        isAssigned ? 'assignment' : 'status_change',
        'create'
      );
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
    console.error('Task create error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ─── GET ALL ─────────────────────────────────────────────────────────────────
const getAll = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const skip = (page - 1) * limit;

    const filter = { companyId: req.user.companyId };

    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
    if (req.query.projectId) filter.projectId = req.query.projectId;

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
    console.error('Task getAll error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ─── GET ONE ─────────────────────────────────────────────────────────────────
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
    console.error('Task getOne error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ─── UPDATE (full edit) ───────────────────────────────────────────────────────
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
      { title, description, priority, status, dueDate, labels, projectId, assignedTo },
      { new: true, runValidators: true }
    );

    // Notify the newly-assigned user if assignment changed
    if (assignedTo && assignedTo.toString() !== existingTask.assignedTo?.toString()) {
      await safeNotify(
        req.user.companyId,
        assignedTo,   // ← guaranteed defined here (checked in the if)
        `You have been assigned to task: "${task.title}"`,
        'assignment',
        'update:assign'
      );
    }

    emitTaskUpdate(req.user.companyId, task);

    res.json(task);
  } catch (error) {
    console.error('Task update error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ─── UPDATE STATUS (drag-and-drop) ───────────────────────────────────────────
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

    // Only notify if a user is actually assigned
    if (existingTask.assignedTo) {
      await safeNotify(
        req.user.companyId,
        existingTask.assignedTo,  // ← guaranteed defined (checked above)
        `Task "${task.title}" status updated to "${status}"`,
        'status_change',
        'updateStatus'
      );
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
    console.error('Task updateStatus error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ─── ASSIGN ──────────────────────────────────────────────────────────────────
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

    // Only notify if a recipient was actually provided
    if (assignedTo) {
      await safeNotify(
        req.user.companyId,
        assignedTo,   // ← guaranteed defined (checked above)
        `You have been assigned to task: "${task.title}"`,
        'assignment',
        'assign'
      );
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
    console.error('Task assign error:', error);   // was missing before — silent failures fixed
    res.status(500).json({ message: error.message });
  }
};

// ─── REMOVE ──────────────────────────────────────────────────────────────────
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
    console.error('Task remove error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { create, getAll, getOne, update, updateStatus, assign, remove };
