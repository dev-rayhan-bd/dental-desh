import { z } from 'zod';


const addressValidationSchema = z.object({
  formattedAddress: z.string().min(1, "Location is required from map"),
  houseNo: z.string().optional(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
});

const createDeliveryQuoteZodSchema = z.object({
  pickupLocation: addressValidationSchema,
  dropOffs: z.array(
    z.object({
      receiverName: z.string().min(1, "Receiver name is required"),
      receiverPhone: z.string().min(1, "Receiver phone is required"),
      receiverAddress: addressValidationSchema,
      packageName: z.string().min(1, "Package name is required"),
      quantity: z.number().min(1, "Quantity must be at least 1"),
      weight: z.string().min(1, "Weight is required"),
    })
  ).min(1, "At least one drop-off is required"),
});

export const DeliveryQuoteValidation = {
  createDeliveryQuoteZodSchema,
};