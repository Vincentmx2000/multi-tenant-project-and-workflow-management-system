const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const { createRules, updateRules } = require('../validators/projectValidators');
const {
  create,
  getAll,
  getOne,
  update,
  remove,
} = require('../controllers/projectController');

const router = express.Router();

router.use(authMiddleware);

router.post('/', checkRole(['Owner', 'Admin']), createRules, validate, create);
router.get('/', getAll);
router.get('/:id', getOne);
router.put('/:id', checkRole(['Owner', 'Admin']), updateRules, validate, update);
router.delete('/:id', checkRole(['Owner', 'Admin']), remove);

module.exports = router;
