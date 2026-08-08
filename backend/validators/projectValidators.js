const { body } = require('express-validator');

const createRules = [
  body('title').notEmpty().withMessage('Title is required'),
  body('deadline')
    .optional({ values: 'null' })
    .isISO8601()
    .withMessage('Deadline must be a valid date'),
];

const updateRules = [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('deadline')
    .optional({ values: 'null' })
    .isISO8601()
    .withMessage('Deadline must be a valid date'),
];

module.exports = { createRules, updateRules };
