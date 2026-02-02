import express from 'express';
import auth from '../../middleware/auth';

import { upload } from '../../middleware/multer';
import { DeliveryQuoteController } from './delivery.controller';
import { USER_ROLE } from '../Auth/auth.constant';
import validateRequest from '../../middleware/validateRequest';
import { DeliveryQuoteValidation } from './deliveryQuote.validation';

const router = express.Router();

router.post(
  '/create',
  auth(USER_ROLE.user),
  validateRequest(DeliveryQuoteValidation.createDeliveryQuoteZodSchema),
  DeliveryQuoteController.createDeliveryQuote
);

router.patch(
  '/update-status/:id/:index',
  auth('driver'), // rider/driver role
  upload.fields([
    { name: 'deliveryProofImg', maxCount: 1 },
    { name: 'signatureImg', maxCount: 1 }
  ]),
    // validateRequest(DeliveryQuoteValidation.createDeliveryQuoteZodSchema),
  DeliveryQuoteController.updateParcelStatus
);

export const DeliveryQuoteRoutes = router;