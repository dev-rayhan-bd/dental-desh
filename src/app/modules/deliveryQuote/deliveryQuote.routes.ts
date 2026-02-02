import express from 'express';
import auth from '../../middleware/auth';

import { upload } from '../../middleware/multer';
import { DeliveryQuoteController } from './delivery.controller';

const router = express.Router();

router.patch(
  '/update-status/:id/:index',
  auth('driver'), // rider/driver role
  upload.fields([
    { name: 'deliveryProofImg', maxCount: 1 },
    { name: 'signatureImg', maxCount: 1 }
  ]),
  DeliveryQuoteController.updateParcelStatus
);

export const DeliveryQuoteRoutes = router;