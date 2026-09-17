import mongoose, { Schema, Document, Model } from 'mongoose';
import { IProject } from '../types';

export interface IProjectDocument extends Omit<IProject, '_id'>, Document {}

const projectSchema = new Schema<IProjectDocument>(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String },
    deadline: { type: Date },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Project: Model<IProjectDocument> = mongoose.model<IProjectDocument>('Project', projectSchema);
export default Project;
