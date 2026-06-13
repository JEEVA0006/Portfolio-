const Project = require('../models/Project');
const cloudinary = require('../config/cloudinary');

// @desc    Get all projects (with search, filter, pagination)
// @route   GET /api/projects
// @access  Public
exports.getProjects = async (req, res, next) => {
  try {
    const { search, tech, category, featured, page = 1, limit = 9 } = req.query;

    const query = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (tech) {
      query.technologies = { $in: [new RegExp(tech, 'i')] };
    }
    if (category) {
      query.category = category;
    }
    if (featured === 'true') {
      query.featured = true;
    }

    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: projects.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: projects,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

// @desc    Create project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res, next) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Delete image from cloudinary if exists
    if (project.imagePublicId) {
      await cloudinary.uploader.destroy(project.imagePublicId);
    }

    await project.deleteOne();
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all unique technologies
// @route   GET /api/projects/technologies
// @access  Public
exports.getTechnologies = async (req, res, next) => {
  try {
    const techs = await Project.distinct('technologies');
    res.json({ success: true, data: techs.sort() });
  } catch (err) {
    next(err);
  }
};
