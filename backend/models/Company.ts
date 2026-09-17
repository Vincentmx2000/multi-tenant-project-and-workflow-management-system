import mongoose, { Schema, Document, Model } from 'mongoose';
import { ICompany } from '../types';

export interface ICompanyDocument extends Omit<ICompany, '_id'>, Document {}

const companySchema = new Schema<ICompanyDocument>(
  {
    name: { type: String, required: true },
  },
  { timestamps: true }
);

export const Company: Model<ICompanyDocument> = mongoose.model<ICompanyDocument>('Company', companySchema);
export default Company;
