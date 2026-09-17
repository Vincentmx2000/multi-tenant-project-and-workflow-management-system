import { body, ValidationChain } from 'express-validator';

export const createRules: ValidationChain[] = [
  body('title').notEmpty().withMessage('Title is required'),
  body('deadline')
    .optional({ values: 'null' })
    .isISO8601()
    .withMessage('Deadline must be a valid date'),
];

export const updateRules: ValidationChain[] = [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('deadline')
    .optional({ values: 'null' })
    .isISO8601()
    .withMessage('Deadline must be a valid date'),
];

export default { createRules, updateRules };
