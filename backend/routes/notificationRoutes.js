const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getMine, markRead } = require('../controllers/notificationController');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getMine);
router.patch('/:id/read', markRead);

module.exports = router;
