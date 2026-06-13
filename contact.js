const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages,
  markRead,
  deleteMessage,
  getStats,
} = require('../controllers/contactController');
const { protect } = require('../middleware/auth');

router.post('/', sendMessage);
router.get('/', protect, getMessages);
router.get('/stats', protect, getStats);
router.put('/:id/read', protect, markRead);
router.delete('/:id', protect, deleteMessage);

module.exports = router;
