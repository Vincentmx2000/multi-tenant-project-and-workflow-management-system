const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');
const {
  create,
  getAll,
  getOne,
  update,
  remove,
} = require('../controllers/projectController');

const router = express.Router();

router.use(authMiddleware);

router.post('/', checkRole(['Owner', 'Admin']), create);
router.get('/', getAll);
router.get('/:id', getOne);
router.put('/:id', checkRole(['Owner', 'Admin']), update);
router.delete('/:id', checkRole(['Owner', 'Admin']), remove);

module.exports = router;
