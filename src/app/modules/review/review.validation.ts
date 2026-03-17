import { z } from 'zod';

const createReviewZodSchema = z.object({

    rider: z.string().min(1, "Rider ID is required"),
    order: z.string().min(1, "Order ID is required"),
    rating: z.number().min(1).max(5),
    comment: z.string().min(1, "Comment is required"),

});

export const ReviewValidation = { createReviewZodSchema };