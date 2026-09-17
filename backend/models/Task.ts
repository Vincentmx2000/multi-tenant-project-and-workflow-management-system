import mongoose, { Schema, Document, Model } from 'mongoose';
import { ITask } from '../types';

export interface ITaskDocument extends Omit<ITask, '_id'>, Document {}

const taskSchema = new Schema<ITaskDocument>(
  {
    title: { type: String, required: true },
    description: { type: String },
    priority: { type: String },
    status: { type: String },
    dueDate: { type: Date },
    labels: [{ type: String }],
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Task: Model<ITaskDocument> = mongoose.model<ITaskDocument>('Task', taskSchema);
export default Task;
