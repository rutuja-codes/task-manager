// ============================================
// routes/project.routes.js
// ============================================
// WHY THIS FILE?
// Connects URLs to project controller functions.
// ALL routes are protected — user must be logged in.
//
// ROUTES:
// GET    /api/projects              → getProjects
// POST   /api/projects              → createProject
// GET    /api/projects/:id          → getProject
// PUT    /api/projects/:id          → updateProject
// DELETE /api/projects/:id          → deleteProject
// POST   /api/projects/:id/members  → addMember
// DELETE /api/projects/:id/members/:userId → removeMember
// ============================================

const express = require('express');
const router = express.Router();

const projectController = require('../controllers/project.controller');
const { protect } = require('../middleware/auth.middleware');

// All project routes require login
// protect middleware runs before every controller function
router.use(protect);

router.get('/', projectController.getProjects);
router.post('/', projectController.createProject);
router.get('/:id', projectController.getProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);
router.post('/:id/members', projectController.addMember);
router.delete('/:id/members/:userId', projectController.removeMember);

module.exports = router;