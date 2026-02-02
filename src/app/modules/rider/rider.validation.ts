import { z } from 'zod';

const createRiderZodSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  email: z.string().trim().email("Invalid email address").min(1, "Email is required"),
  contact: z.string().trim().min(1, "Contact number is required"),
  dob: z.string().min(1, "Date of birth is required"),
  identificationNo: z.string().min(1, "NID/Passport No is required"),
  location: z.string().trim().min(1, "Location is required"),
   fcmToken: z
      .string({ message: "fcmToken is required" })
      .trim(),

  vehicleType: z.enum(['car', 'bike', 'other']), 
  
  vehicleNumber: z.string().min(1, "Vehicle number is required"),
  

  gender: z.enum(['male', 'female', 'other']),
  
  password: z.string().min(6, "Password must be at least 6 characters"),
});












const updateRiderZodSchema = z.object({
  fullName: z.string().optional(),
  contact: z.string().optional(),
  location: z.string().optional(),
  isAvailable: z.boolean().optional(),
  vehicleType: z.enum(['car', 'bike', 'other']).optional(),
  vehicleNumber: z.string().optional(),
});

export const RiderValidation = {
  createRiderZodSchema,
  updateRiderZodSchema,
};