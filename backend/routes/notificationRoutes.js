const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getMine, markRead, markAllRead } = require('../controllers/notificationController');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getMine);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);

module.exports = router;
