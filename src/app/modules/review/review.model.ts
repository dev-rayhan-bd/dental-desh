import { Schema, model } from 'mongoose';
import { IReview } from './review.interface';

const reviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rider: { type: Schema.Types.ObjectId, ref: 'Rider', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true }, 
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

export const Review = model<IReview>('Review', reviewSchema);