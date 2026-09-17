import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser, ROLES } from '../types';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {}

const userSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    role: {
      type: String,
      enum: ROLES,
      required: true,
    },
  },
  { timestamps: true }
);

export const User: Model<IUserDocument> = mongoose.model<IUserDocument>('User', userSchema);
export default User;
