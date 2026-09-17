import mongoose, { Schema, Document, Model } from 'mongoose';
import { INotification } from '../types';

export interface INotificationDocument extends Omit<INotification, '_id'>, Document {}

const notificationSchema = new Schema<INotificationDocument>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    type: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification: Model<INotificationDocument> = mongoose.model<INotificationDocument>('Notification', notificationSchema);
export default Notification;
