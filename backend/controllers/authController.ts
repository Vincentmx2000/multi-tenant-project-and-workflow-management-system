import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import User from '../models/User';
import Company from '../models/Company';
import generateToken from '../utils/generateToken';
import { Role } from '../types';

export const register = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    const { name, email, password, companyId, companyName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let resolvedCompanyId: Types.ObjectId;
    let role: Role;

    if (!companyId) {
      if (!companyName) {
        return res.status(400).json({ message: 'Company name is required when creating a new company' });
      }
      const company = await Company.create({ name: companyName });
      resolvedCompanyId = company._id as Types.ObjectId;
      role = 'Owner';
    } else {
      const company = await Company.findById(companyId);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }
      resolvedCompanyId = company._id as Types.ObjectId;
      role = 'Member';
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      companyId: resolvedCompanyId,
      role,
    });

    const companyObj = await Company.findById(resolvedCompanyId);
    const token = generateToken(user._id as Types.ObjectId);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        companyId: user.companyId,
        companyName: companyObj?.name || 'Company',
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const companyObj = await Company.findById(user.companyId);
    const token = generateToken(user._id as Types.ObjectId);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        companyId: user.companyId,
        companyName: companyObj?.name || 'Company',
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
  }
};

export default { register, login };
