import { Router } from 'express';
import auth from '../../middleware/auth';
import { DeliveryQuoteController } from './delivery.controller';
import { upload } from '../../middleware/multer';
import validateRequest from '../../middleware/validateRequest';
import { DeliveryQuoteValidation } from './deliveryQuote.validation';

const router = Router();

router.post('/create', auth('user'), validateRequest(DeliveryQuoteValidation.createDeliveryQuoteZodSchema), DeliveryQuoteController.createQuote);

router.get('/all-quotes', auth('superAdmin', 'driver'), DeliveryQuoteController.getAllQuotes);

router.get('/my-quotes', auth('user'), DeliveryQuoteController.getMyQuotes); 

router.get('/single/:id', auth('user', 'driver', 'superAdmin'), DeliveryQuoteController.getSingleQuote);


router.patch('/accept-job/:id', auth('driver'), DeliveryQuoteController.acceptJob);


router.patch(
  '/update-status/:id/:index', 
  auth('driver'), 
  upload.fields([{ name: 'deliveryProofImg' }, { name: 'signatureImg' }]), 
  (req, res, next) => {
    if (req.body.body) req.body = JSON.parse(req.body.body);
    next();
  },
  DeliveryQuoteController.updateParcelStatus
);

export const DeliveryQuoteRoutes = router;