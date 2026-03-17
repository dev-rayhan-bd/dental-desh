import { Review } from './review.model';
import { Rider } from '../rider/rider.model';
import mongoose from 'mongoose';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';

const createReviewInDB = async (payload: any) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

  
    const result = await Review.create([payload], { session });


    const stats = await Review.aggregate([
      { $match: { rider: new mongoose.Types.ObjectId(payload.rider) } },
      { $group: { _id: '$rider', avgRating: { $avg: '$rating' } } }
    ]).session(session);

    const newAvgRating = stats.length > 0 ? stats[0].avgRating : payload.rating;

    await Rider.findByIdAndUpdate(
      payload.rider,
      { rating: parseFloat(newAvgRating.toFixed(1)) },
      { session }
    );

    await session.commitTransaction();
    return result[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};


const getRiderReviewsFromDB = async (riderId: string, query: Record<string, unknown>) => {
  const reviewQuery = new QueryBuilder(
    Review.find({ rider: riderId }).populate('user', 'fullName image'), // কাস্টমারের নাম ও ছবি সহ
    query
  )
    .filter()
    .sort('-createdAt') // লেটেস্ট রিভিউ আগে
    .paginate()
    .fields();

  const result = await reviewQuery.modelQuery;
  const meta = await reviewQuery.countTotal();

  return { meta, result };
};
export const ReviewService = { createReviewInDB, getRiderReviewsFromDB };