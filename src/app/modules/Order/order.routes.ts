import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../Auth/auth.constant';
import { OrderController } from './order.controller';

const router = express.Router();


router.get('/all-history', auth(USER_ROLE.superAdmin), OrderController.getAllOrders);


router.get('/my-history', auth(USER_ROLE.user), OrderController.getMyOrders);


router.get('/track/:trackingId', OrderController.trackOrder);


router.get('/details/:id', auth(USER_ROLE.user, USER_ROLE.superAdmin), OrderController.getSingleOrder);

export const OrderRoutes = router;