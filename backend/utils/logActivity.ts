import { Types } from 'mongoose';
import ActivityLog, { IActivityLogDocument } from '../models/ActivityLog';

export interface LogActivityParams {
  companyId: string | Types.ObjectId;
  projectId?: string | Types.ObjectId;
  userId: string | Types.ObjectId;
  action: string;
}

export const logActivity = async ({
  companyId,
  projectId,
  userId,
  action,
}: LogActivityParams): Promise<IActivityLogDocument | undefined> => {
  try {
    return await ActivityLog.create({
      companyId,
      projectId,
      userId,
      action,
    });
  } catch (error) {
    console.error('Failed to create activity log:', error);
    return undefined;
  }
};

export default logActivity;
