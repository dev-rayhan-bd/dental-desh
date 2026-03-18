import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ReviewService } from './review.services';


const createReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.createReviewInDB({
    ...req.body,
    user: req.user.userId,
  });
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Review submitted successfully',
    data: result,
  });
});

const getMyReviews = catchAsync(async (req: Request, res: Response) => {
//   const riderId = req.user.userId;
  const { riderId } = req.params;
  const result = await ReviewService.getRiderReviewsFromDB(riderId as string, req.query); 

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Your reviews retrieved successfully",
    data: result,
  });
});

export const ReviewController = { createReview, getMyReviews };