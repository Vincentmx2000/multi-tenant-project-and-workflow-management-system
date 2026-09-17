import { body, ValidationChain } from 'express-validator';

export const createRules: ValidationChain[] = [
  body('title').notEmpty().withMessage('Title is required'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('dueDate')
    .optional({ values: 'null' })
    .isISO8601()
    .withMessage('Due date must be a valid date'),
];

export const updateRules: ValidationChain[] = [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('dueDate')
    .optional({ values: 'null' })
    .isISO8601()
    .withMessage('Due date must be a valid date'),
];

export default { createRules, updateRules };
