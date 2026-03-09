// ============================================
// controllers/task.controller.js
// ============================================
// WHY THIS FILE?
// Contains all business logic for tasks:
// Create, Read, Update, Delete + Move between columns
//
// KEY FEATURE — REAL TIME UPDATES:
// Every task change emits a Socket.io event
// So ALL users in same project see changes instantly!
// ============================================

const Task = require('../models/task.model');
const Project = require('../models/project.model');

// ─── Helper: Check Project Access ────────────
// WHY? Every task route needs to verify user
// has access to the project the task belongs to.
// Instead of repeating this check, we use a helper.
const checkProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return { error: 'Project not found', status: 404 };

  const isOwner = project.owner.toString() === userId;
  const isMember = project.members.some(
    m => m.user.toString() === userId
  );

  if (!isOwner && !isMember) {
    return { error: 'Not authorized to access this project', status: 403 };
  }

  return { project };
};

// ─── GET ALL TASKS FOR A PROJECT ──────────────
// @route  GET /api/tasks?projectId=xxx
// @access Private
exports.getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide projectId'
      });
    }

    // Check user has access to this project
    const access = await checkProjectAccess(projectId, req.user.id);
    if (access.error) {
      return res.status(access.status).json({
        success: false,
        message: access.error
      });
    }

    // Get all tasks for this project
    // sorted by position so kanban order is maintained
    const tasks = await Task.find({
      project: projectId,
      isArchived: false
    })
    .populate('createdBy', 'name email avatar')
    .populate('assignee', 'name email avatar')
    .sort({ position: 1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });

  } catch (error) {
    console.error('GetTasks error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// ─── GET SINGLE TASK ──────────────────────────
// @route  GET /api/tasks/:id
// @access Private
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('assignee', 'name email avatar')
      .populate('project', 'name color');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check user has access to the project this task belongs to
    const access = await checkProjectAccess(
      task.project._id.toString(),
      req.user.id
    );
    if (access.error) {
      return res.status(access.status).json({
        success: false,
        message: access.error
      });
    }

    res.status(200).json({
      success: true,
      task
    });

  } catch (error) {
    console.error('GetTask error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// ─── CREATE TASK ──────────────────────────────
// @route  POST /api/tasks
// @access Private
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      projectId,
      status,
      priority,
      assignee,
      dueDate,
      labels
    } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and projectId'
      });
    }

    // Check project access
    const access = await checkProjectAccess(projectId, req.user.id);
    if (access.error) {
      return res.status(access.status).json({
        success: false,
        message: access.error
      });
    }

    // Get the highest position in this column
    // WHY? New tasks go to the BOTTOM of the column
    const lastTask = await Task.findOne({
      project: projectId,
      status: status || 'Todo'
    }).sort({ position: -1 });

    // New task position = last task position + 1
    const position = lastTask ? lastTask.position + 1 : 0;

    // Create task
    const task = await Task.create({
      title,
      description: description || '',
      project: projectId,
      status: status || 'Todo',
      priority: priority || 'medium',
      createdBy: req.user.id,
      assignee: assignee || null,
      dueDate: dueDate || null,
      labels: labels || [],
      position
    });

    // Populate task data
    await task.populate('createdBy', 'name email avatar');
    await task.populate('assignee', 'name email avatar');

    // Emit real-time event to ALL users in this project room
    // WHY? When someone creates a task, everyone sees it instantly!
    const io = req.app.get('io');
    io.to(projectId).emit('task_created', task);

    res.status(201).json({
      success: true,
      task
    });

  } catch (error) {
    console.error('CreateTask error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// ─── UPDATE TASK ──────────────────────────────
// @route  PUT /api/tasks/:id
// @access Private
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check project access
    const access = await checkProjectAccess(
      task.project.toString(),
      req.user.id
    );
    if (access.error) {
      return res.status(access.status).json({
        success: false,
        message: access.error
      });
    }

    const {
      title,
      description,
      status,
      priority,
      assignee,
      dueDate,
      labels
    } = req.body;

    // Build update object
    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignee !== undefined) updateData.assignee = assignee;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (labels) updateData.labels = labels;

    task = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('createdBy', 'name email avatar')
    .populate('assignee', 'name email avatar');

    // Emit real-time update to all project members
    const io = req.app.get('io');
    io.to(task.project.toString()).emit('task_updated', task);

    res.status(200).json({
      success: true,
      task
    });

  } catch (error) {
    console.error('UpdateTask error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// ─── MOVE TASK (Drag & Drop) ──────────────────
// @route  PATCH /api/tasks/:id/move
// @access Private
// WHY SEPARATE ROUTE?
// Moving a task on kanban board is a very frequent action.
// It only updates status + position — nothing else.
// Keeping it separate makes it cleaner and faster.
exports.moveTask = async (req, res) => {
  try {
    const { status, position } = req.body;

    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check project access
    const access = await checkProjectAccess(
      task.project.toString(),
      req.user.id
    );
    if (access.error) {
      return res.status(access.status).json({
        success: false,
        message: access.error
      });
    }

    // Update task status and position
    task = await Task.findByIdAndUpdate(
      req.params.id,
      { status, position },
      { new: true }
    )
    .populate('createdBy', 'name email avatar')
    .populate('assignee', 'name email avatar');

    // Emit real-time move event to all project members
    // This is what makes the kanban board update live!
    const io = req.app.get('io');
    io.to(task.project.toString()).emit('task_moved', {
      taskId: task._id,
      status,
      position,
      task
    });

    res.status(200).json({
      success: true,
      task
    });

  } catch (error) {
    console.error('MoveTask error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// ─── DELETE TASK ──────────────────────────────
// @route  DELETE /api/tasks/:id
// @access Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check project access
    const access = await checkProjectAccess(
      task.project.toString(),
      req.user.id
    );
    if (access.error) {
      return res.status(access.status).json({
        success: false,
        message: access.error
      });
    }

    const projectId = task.project.toString();
    await task.deleteOne();

    // Emit real-time delete event
    const io = req.app.get('io');
    io.to(projectId).emit('task_deleted', {
      taskId: req.params.id,
      projectId
    });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('DeleteTask error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};