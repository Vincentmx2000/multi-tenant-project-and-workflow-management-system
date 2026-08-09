const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const { createRules, updateRules } = require('../validators/taskValidators');
const {
  create,
  getAll,
  getOne,
  update,
  updateStatus,
  assign,
  remove,
} = require('../controllers/taskController');

const router = express.Router();

router.use(authMiddleware);

router.post('/', checkRole(['Owner', 'Admin', 'Manager']), createRules, validate, create);
router.get('/', getAll);
router.patch('/:id/status', updateStatus);
router.patch('/:id/assign', checkRole(['Owner', 'Admin', 'Manager']), assign);
router.get('/:id', getOne);
router.put('/:id', checkRole(['Owner', 'Admin', 'Manager']), updateRules, validate, update);
router.delete('/:id', checkRole(['Owner', 'Admin', 'Manager']), remove);

module.exports = router;
