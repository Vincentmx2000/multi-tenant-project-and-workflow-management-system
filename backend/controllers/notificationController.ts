import { Response } from 'express';
import Notification from '../models/Notification';
import { AuthenticatedRequest } from '../types';

export const getMine = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> => {
  try {
    const notifications = await Notification.find({
      userId: req.user._id,
      companyId: req.user.companyId,
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
  }
};

export const markRead = async (
  req: AuthenticatedRequest<{ id: string }>,
  res: Response
): Promise<void | Response> => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
        companyId: req.user.companyId,
      },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
  }
};

export const markAllRead = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> => {
  try {
    await Notification.updateMany(
      {
        userId: req.user._id,
        companyId: req.user.companyId,
        read: false,
      },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
  }
};

export default { getMine, markRead, markAllRead };
