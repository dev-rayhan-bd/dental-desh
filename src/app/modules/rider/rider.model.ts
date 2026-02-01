import { Schema, model } from 'mongoose';
import { IRider, RiderModel } from './rider.interface';

const riderSchema = new Schema<IRider, RiderModel>(
  {
    fullName: { type: String, required: true, trim: true },
    image: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    contact: { type: String, required: true },
    dob: { type: Date, required: true },
    identificationNo: { type: String, required: true, unique: true },
    location: { type: String, required: true },
    vehicleType: {
      type: String,
      enum: ['car', 'bike', 'other'],
      required: true,
    },
    vehicleNumber: { type: String, required: true, unique: true },
    drivingLicense: { type: String, required: true },
    vehicleImage: { type: String, required: true },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
    },
    isAvailable: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const Rider = model<IRider, RiderModel>('Rider', riderSchema);