import mongoose, { Schema, Document, Model } from 'mongoose';
import { IComment } from '../types';

export interface ICommentDocument extends Omit<IComment, '_id'>, Document {}

const commentSchema = new Schema<ICommentDocument>(
  {
    text: { type: String, required: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  },
  { timestamps: true }
);

export const Comment: Model<ICommentDocument> = mongoose.model<ICommentDocument>('Comment', commentSchema);
export default Comment;
