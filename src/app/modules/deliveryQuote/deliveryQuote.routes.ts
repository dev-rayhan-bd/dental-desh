import { Router } from 'express';
import auth from '../../middleware/auth';
import { DeliveryQuoteController } from './delivery.controller';

import validateRequest from '../../middleware/validateRequest';
import { DeliveryQuoteValidation } from './deliveryQuote.validation';

const router = Router();

router.post('/create', auth('user'), validateRequest(DeliveryQuoteValidation.createDeliveryQuoteZodSchema), DeliveryQuoteController.createQuote);

router.get('/all-quotes', auth('superAdmin', 'driver'), DeliveryQuoteController.getAllQuotes);

router.get('/my-quotes', auth('user'), DeliveryQuoteController.getMyQuotes); 

router.get('/single/:id', auth('user', 'driver', 'superAdmin'), DeliveryQuoteController.getSingleQuote);


router.patch('/accept-job/:id', auth('driver'), DeliveryQuoteController.acceptJob);



export const DeliveryQuoteRoutes = router;