const Project = require('../models/Project');
const logActivity = require('../utils/logActivity');

const create = async (req, res) => {
  try {
    const { title, description, status, deadline, members } = req.body;

    const project = await Project.create({
      title,
      description,
      status,
      deadline,
      members,
      companyId: req.user.companyId,
      createdBy: req.user._id,
    });

    await logActivity({
      companyId: req.user.companyId,
      projectId: project._id,
      userId: req.user._id,
      action: `Project created: ${project.title}`,
    });

    res.status(201).json(project);
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

    const [data, total] = await Promise.all([
      Project.find(filter).skip(skip).limit(limit),
      Project.countDocuments(filter),
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
    const project = await Project.findOne({
      _id: req.params.id,
      companyId: req.user.companyId,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { title, description, status, deadline, members } = req.body;

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      { title, description, status, deadline, members },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await logActivity({
      companyId: req.user.companyId,
      projectId: project._id,
      userId: req.user._id,
      action: `Project updated: ${project.title}`,
    });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      companyId: req.user.companyId,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await logActivity({
      companyId: req.user.companyId,
      projectId: project._id,
      userId: req.user._id,
      action: `Project deleted: ${project.title}`,
    });

    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { create, getAll, getOne, update, remove };
