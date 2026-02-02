import { Model } from "mongoose";
import { TUser, IUserMethods, User } from "../User/user.interface";


export interface IRider extends TUser {
  identificationNo: string;
  vehicleType: 'car' | 'bike' | 'other';
  vehicleNumber: string;
  drivingLicense: string;
  vehicleImage: string;
  gender: 'male' | 'female' | 'other';
  isAvailable: boolean;
}


export interface RiderModel extends Model<IRider, {}, IUserMethods> {
  isUserExistsByEmail(email: string): Promise<IRider>;
  isUserExistsById(id: string): Promise<IRider>;
  isPasswordMatched(plainTextPassword: string, hashedPassword: string): Promise<boolean>;
  isJWTIssuedBeforePasswordChanged(passwordChangedTimestamp: Date, jwtIssuedTimestamp: number): boolean;
}