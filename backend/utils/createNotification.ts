import { Types } from 'mongoose';
import Notification, { INotificationDocument } from '../models/Notification';

export interface CreateNotificationParams {
  companyId: string | Types.ObjectId;
  userId: string | Types.ObjectId;
  message: string;
  type: string;
}

export const createNotification = async ({
  companyId,
  userId,
  message,
  type,
}: CreateNotificationParams): Promise<INotificationDocument> => {
  return Notification.create({ companyId, userId, message, type });
};

export default createNotification;
