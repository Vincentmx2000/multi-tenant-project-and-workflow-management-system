const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getByProject } = require('../controllers/activityController');

const router = express.Router();

router.use(authMiddleware);

router.get('/project/:projectId', getByProject);
router.get('/:projectId', getByProject);

module.exports = router;
