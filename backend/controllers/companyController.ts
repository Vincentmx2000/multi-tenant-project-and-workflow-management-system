import { Response } from 'express';
import Company from '../models/Company';
import User from '../models/User';
import { AuthenticatedRequest, Role, ROLES } from '../types';

// GET /api/company/me — get current user's company
export const getCompanyMe = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> => {
  try {
    const company = await Company.findById(req.user.companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
  }
};

// GET /api/company/users — get all users in current user's company
export const getCompanyUsers = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> => {
  try {
    const users = await User.find({ companyId: req.user.companyId })
      .select('-password')
      .sort({ createdAt: 1 });
    res.json(users);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/company/users/:userId/role — update user role (Owner only)
export const updateUserRole = async (
  req: AuthenticatedRequest<{ userId: string }, any, { role?: string }>,
  res: Response
): Promise<void | Response> => {
  try {
    const { role } = req.body;
    const { userId } = req.params;

    const matchedRole = ROLES.find(
      (r) => r.toLowerCase() === (role || '').trim().toLowerCase()
    ) as Role | undefined;

    if (!matchedRole) {
      return res.status(400).json({
        message: 'Invalid role. Role must be Owner, Admin, Manager, or Member.',
      });
    }

    // Ensure the target user belongs to the requester's company
    const targetUser = await User.findOne({
      _id: userId,
      companyId: req.user.companyId,
    });

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found in your company' });
    }

    targetUser.role = matchedRole;
    await targetUser.save();

    const updatedUser = await User.findById(userId).select('-password');
    res.json(updatedUser);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
  }
};

export default { getCompanyMe, getCompanyUsers, updateUserRole };
