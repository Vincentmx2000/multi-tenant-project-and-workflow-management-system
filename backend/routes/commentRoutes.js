const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { add, getByTask, remove } = require('../controllers/commentController');

const router = express.Router();

router.use(authMiddleware);

router.post('/', add);
router.get('/task/:taskId', getByTask);
router.delete('/:id', remove);

module.exports = router;
