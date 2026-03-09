// ============================================
// models/task.model.js — Task Structure
// ============================================
// WHY THIS FILE?
// Defines how a Task looks in MongoDB.
// A task belongs to a project, has a status (column),
// priority, assignee, and due date.
//
// RELATIONSHIP:
// Task → belongs to → Project
// Task → assigned to → User
// ============================================

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters']
    },

    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: ''
    },

    // WHICH project this task belongs to
    // Every task MUST belong to a project
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required']
    },

    // WHICH column (kanban status) this task is in
    // Must match one of the project's columns
    // Default is 'Todo' — new tasks start here
    status: {
      type: String,
      default: 'Todo'
    },

    // Task priority — affects UI color/badge
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },

    // WHO created this task
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // WHO is assigned to this task (optional)
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    // Task due date (optional)
    dueDate: {
      type: Date,
      default: null
    },

    // Position in the column for ordering
    // WHY? When user drags tasks, we update this number
    // to maintain order within a column
    position: {
      type: Number,
      default: 0
    },

    // Task labels/tags for filtering
    labels: {
      type: [String],
      default: []
    },

    isArchived: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// ─── Index for faster queries ─────────────────
// WHY INDEX?
// When we fetch tasks for a project, MongoDB searches
// through ALL tasks to find matching ones.
// An index makes this search MUCH faster — like a book index!
// We always query tasks by project + status together
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ project: 1, position: 1 });

module.exports = mongoose.model('Task', taskSchema);