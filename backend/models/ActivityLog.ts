import mongoose, { Schema, Document, Model } from 'mongoose';
import { IActivityLog } from '../types';

export interface IActivityLogDocument extends Omit<IActivityLog, '_id'>, Document {}

const activityLogSchema = new Schema<IActivityLogDocument>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
  },
  { timestamps: true }
);

export const ActivityLog: Model<IActivityLogDocument> = mongoose.model<IActivityLogDocument>('ActivityLog', activityLogSchema);
export default ActivityLog;
