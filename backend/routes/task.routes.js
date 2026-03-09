// ============================================
// routes/task.routes.js
// ============================================
// WHY THIS FILE?
// Connects URLs to task controller functions.
// ALL routes are protected — user must be logged in.
//
// ROUTES:
// GET    /api/tasks?projectId=xxx  → getTasks
// POST   /api/tasks                → createTask
// GET    /api/tasks/:id            → getTask
// PUT    /api/tasks/:id            → updateTask
// PATCH  /api/tasks/:id/move       → moveTask (drag & drop)
// DELETE /api/tasks/:id            → deleteTask
// ============================================

const express = require('express');
const router = express.Router();

const taskController = require('../controllers/task.controller');
const { protect } = require('../middleware/auth.middleware');

// All task routes require login
router.use(protect);

router.get('/', taskController.getTasks);
router.post('/', taskController.createTask);
router.get('/:id', taskController.getTask);
router.put('/:id', taskController.updateTask);
router.patch('/:id/move', taskController.moveTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;