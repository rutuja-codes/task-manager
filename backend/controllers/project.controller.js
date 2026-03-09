// ============================================
// controllers/project.controller.js
// ============================================
// WHY THIS FILE?
// Contains all business logic for projects:
// Create, Read, Update, Delete (CRUD)
// Also handles adding/removing members
//
// ALL ROUTES ARE PROTECTED — user must be logged in
// req.user is available because protect middleware runs first
// ============================================

const Project = require('../models/project.model');
const User = require('../models/user.model');

// ─── GET ALL PROJECTS ─────────────────────────
// @route  GET /api/projects
// @access Private
// Returns all projects where logged-in user is owner OR member
exports.getProjects = async (req, res) => {
  try {
    // Find projects where:
    // owner === logged in user OR members array contains logged in user
    // $or = MongoDB OR operator
    const projects = await Project.find({
      $or: [
        { owner: req.user.id },
        { 'members.user': req.user.id }
      ],
      isArchived: false
    })
    // .populate() replaces owner's _id with actual user data
    // We only get name, email, avatar — not password!
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    // Sort by newest first
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects
    });

  } catch (error) {
    console.error('GetProjects error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// ─── GET SINGLE PROJECT ───────────────────────
// @route  GET /api/projects/:id
// @access Private
exports.getProject = async (req, res) => {
  try {
    // req.params.id = the :id part from URL
    // Example: GET /api/projects/64abc123 → req.params.id = '64abc123'
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    // Check if project exists
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user has access to this project
    // User must be owner OR a member
    const isOwner = project.owner._id.toString() === req.user.id;
    const isMember = project.members.some(
      m => m.user._id.toString() === req.user.id
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this project'
      });
    }

    res.status(200).json({
      success: true,
      project
    });

  } catch (error) {
    console.error('GetProject error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// ─── CREATE PROJECT ───────────────────────────
// @route  POST /api/projects
// @access Private
exports.createProject = async (req, res) => {
  try {
    const { name, description, color, columns } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required'
      });
    }

    // Create project
    // owner = logged in user (from req.user set by protect middleware)
    // members = owner is automatically added as admin member
    const project = await Project.create({
      name,
      description: description || '',
      color: color || '#6366f1',
      columns: columns || ['Todo', 'In Progress', 'Review', 'Done'],
      owner: req.user.id,
      // Auto-add creator as admin member
      members: [{ user: req.user.id, role: 'admin' }]
    });

    // Populate owner data before sending response
    await project.populate('owner', 'name email avatar');
    await project.populate('members.user', 'name email avatar');

    // Emit socket event so other users see new project in real time
    // req.app.get('io') gets the Socket.io instance we set in server.js
    const io = req.app.get('io');
    io.emit('project_created', project);

    res.status(201).json({
      success: true,
      project
    });

  } catch (error) {
    console.error('CreateProject error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// ─── UPDATE PROJECT ───────────────────────────
// @route  PUT /api/projects/:id
// @access Private (Admin or Owner only)
exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Only owner or admin member can update project
    const isOwner = project.owner.toString() === req.user.id;
    const isAdmin = project.members.some(
      m => m.user.toString() === req.user.id && m.role === 'admin'
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    const { name, description, color, columns } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (color) updateData.color = color;
    if (columns) updateData.columns = columns;

    // { new: true } returns updated document instead of old one
    // { runValidators: true } runs schema validators on update
    project = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

    // Notify all members via socket
    const io = req.app.get('io');
    io.to(req.params.id).emit('project_updated', project);

    res.status(200).json({
      success: true,
      project
    });

  } catch (error) {
    console.error('UpdateProject error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// ─── DELETE PROJECT ───────────────────────────
// @route  DELETE /api/projects/:id
// @access Private (Owner only)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Only OWNER can delete project
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only project owner can delete this project'
      });
    }

    await project.deleteOne();

    // Notify all members via socket
    const io = req.app.get('io');
    io.to(req.params.id).emit('project_deleted', { projectId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('DeleteProject error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// ─── ADD MEMBER ───────────────────────────────
// @route  POST /api/projects/:id/members
// @access Private (Admin or Owner only)
exports.addMember = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide member email'
      });
    }

    // Find project
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if requester is owner or admin
    const isOwner = project.owner.toString() === req.user.id;
    const isAdmin = project.members.some(
      m => m.user.toString() === req.user.id && m.role === 'admin'
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add members'
      });
    }

    // Find user to add by email
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email'
      });
    }

    // Check if user is already a member
    const alreadyMember = project.members.some(
      m => m.user.toString() === userToAdd._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this project'
      });
    }

    // Add member to project
    project.members.push({
      user: userToAdd._id,
      role: role || 'member'
    });

    await project.save();
    await project.populate('members.user', 'name email avatar');

    res.status(200).json({
      success: true,
      message: `${userToAdd.name} added to project successfully`,
      project
    });

  } catch (error) {
    console.error('AddMember error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// ─── REMOVE MEMBER ────────────────────────────
// @route  DELETE /api/projects/:id/members/:userId
// @access Private (Admin or Owner only)
exports.removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Only owner or admin can remove members
    const isOwner = project.owner.toString() === req.user.id;
    const isAdmin = project.members.some(
      m => m.user.toString() === req.user.id && m.role === 'admin'
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove members'
      });
    }

    // Cannot remove the owner
    if (project.owner.toString() === req.params.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove project owner'
      });
    }

    // Filter out the member to remove
    project.members = project.members.filter(
      m => m.user.toString() !== req.params.userId
    );

    await project.save();

    res.status(200).json({
      success: true,
      message: 'Member removed successfully'
    });

  } catch (error) {
    console.error('RemoveMember error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};