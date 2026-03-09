// ============================================
// models/project.model.js — Project Structure
// ============================================
// WHY THIS FILE?
// Defines how a Project looks in MongoDB.
// A project has a name, description, members, and columns.
//
// KEY CONCEPT — RELATIONSHIPS IN MONGODB:
// Unlike SQL (foreign keys), MongoDB uses "references"
// ref: 'User' means this field stores a User's _id
// We use .populate() to get full user data when needed
// ============================================

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: ''
    },

    // WHO created this project
    // ref: 'User' links to our User model
    // This stores the User's MongoDB _id
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Project MEMBERS array
    // Each member has a user reference and a role
    // WHY ARRAY? A project can have multiple members
    members: [
      {
        // ref: 'User' means we store user's _id here
        // Later we use .populate('members.user') to get full user data
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        // Role within THIS project (not global role)
        role: {
          type: String,
          enum: ['admin', 'member'],
          default: 'member'
        }
      }
    ],

    // Kanban board COLUMNS
    // WHY ARRAY? Each project can have custom columns
    // Default columns: Todo, In Progress, Done
    columns: {
      type: [String],
      default: ['Todo', 'In Progress', 'Review', 'Done']
    },

    // Project color for UI
    color: {
      type: String,
      default: '#6366f1' // indigo color
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

module.exports = mongoose.model('Project', projectSchema);