import { Router } from 'express';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { ReviewValidation } from './review.validation';
import { ReviewController } from './review.controller';

const router = Router();

router.post(
  '/give-review',
  auth('user'), 
  validateRequest(ReviewValidation.createReviewZodSchema),
  ReviewController.createReview
);

router.get('/my-reviews',auth('driver'), ReviewController.getMyReviews);

export const ReviewRoutes = router;