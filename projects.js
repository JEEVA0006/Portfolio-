const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getTechnologies,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

router.get('/technologies', getTechnologies);
router.route('/').get(getProjects).post(protect, createProject);
router.route('/:id').get(getProject).put(protect, updateProject).delete(protect, deleteProject);

module.exports = router;
