import { Schema, model } from 'mongoose';
import { IRider, RiderModel } from './rider.interface';
import { IUserMethods } from '../User/user.interface';
import config from '../../config';
import bcrypt from "bcrypt";
const riderSchema = new Schema<IRider, RiderModel, IUserMethods>(
  {
    image: { type: String ,required:true},
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    contact: { type: String, required: true },
    location: { type: String, required: true },
    dob: { type: Date, required: true },
    role: { type: String, default: "driver" },
    fcmToken: { type: String, required: true },
    isOtpVerified: { type: Boolean, default: false },
    
    verification: {
      code: { type: String, default: null },
      expireDate: { type: Date, default: null },
    },

    identificationNo: { type: String, required: true, unique: true },
    vehicleType: { type: String, enum: ["car", "bike", "other"], required: true },
    vehicleNumber: { type: String, required: true, unique: true },
    drivingLicense: { type: String, required: true },
    vehicleImage: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    isAvailable: { type: Boolean, default: false },
     isOnline: { type: Boolean, default: false },  
    status: {
      type: String,
      required: true,
      enum: ["in-progress", "blocked","pending"],
      default: "pending",
    },
    
   lastLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },

  
    wallet: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    totalTrips: { type: Number, default: 0 },
    rating: { type: Number, default: 0 }, 
  },
  { timestamps: true }
);
  

riderSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(
      this.password,
      Number(config.bcrypt_salt_rounds)
    );
  }

  if (this.verification?.code && !this.verification.code.startsWith("$2b$")) {
    this.verification.code = bcrypt.hashSync(
      this.verification.code,
      Number(config.bcrypt_salt_rounds)
    );
  }

});

riderSchema.methods.compareVerificationCode = function (userPlaneCode: string) {
  if (!this.verification?.code) return false;
  return bcrypt.compareSync(userPlaneCode, this.verification.code);
};

riderSchema.statics.isUserExistsByEmail = async function (email: string) {
  return await this.findOne({ email }).select("+password");
};

riderSchema.statics.isPasswordMatched = async function (plainTextPassword, hashedPassword) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};
riderSchema.index({ lastLocation: '2dsphere' });
export const Rider = model<IRider, RiderModel>('Rider', riderSchema);