import { Model, Types } from 'mongoose';

export type TVehicleType = 'car' | 'bike' | 'other';
export type TGender = 'male' | 'female' | 'other';

export interface IRider {
  fullName: string;
  image?: string;
  email: string;
  contact: string; // Phone number
  dob: Date;
  identificationNo: string; // NID or Passport
  location: string;
  vehicleType: TVehicleType;
  vehicleNumber: string;
  drivingLicense: string; // URL to image
  vehicleImage: string; // URL to image
  gender: TGender;
  reviews?: Types.ObjectId[]; // Reference to a Review model
  status: 'active' | 'blocked';
  isAvailable: boolean;
}

export interface RiderModel extends Model<IRider> {
  // Add static methods here if needed
}