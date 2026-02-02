import express from 'express';
import auth from '../../middleware/auth';
import { OrderController } from './order.controller';

const router = express.Router();

router.get('/my-history', auth('user'), OrderController.getMyOrders);
router.get('/track/:trackingId', OrderController.trackOrder);

export const OrderRoutes = router; 