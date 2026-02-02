import { z } from 'zod';

const createDeliveryQuoteZodSchema = z.object({
  pickupLocation: z.string().min(1, "Pickup location is required"),
  dropOffs: z.array(
    z.object({
      receiverName: z.string().min(1, "Receiver name is required"),
      receiverPhone: z.string().min(1, "Receiver phone is required"),
      receiverAddress: z.string().min(1, "Receiver address is required"),
      packageName: z.string().min(1, "Package name is required"),
      quantity: z.number().min(1, "Quantity must be at least 1"),
      weight: z.string().min(1, "Weight is required"),
    })
  ).min(1, "At least one drop-off is required"),
});

export const DeliveryQuoteValidation = {
  createDeliveryQuoteZodSchema,
};