import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../Auth/auth.constant';
import { OrderController } from './order.controller';
import { upload } from '../../middleware/multer';

const router = express.Router();


router.get('/all-history',
    //  auth(USER_ROLE.superAdmin),
 OrderController.getAllOrders);


router.get('/my-history', auth(USER_ROLE.user), OrderController.getMyOrders);


router.get('/track/:trackingId', OrderController.trackOrder);


router.get('/details/:id', auth(USER_ROLE.user, USER_ROLE.superAdmin), OrderController.getSingleOrder);


router.patch(
  '/update-status/:id/:index', 
  auth('driver'), 
  upload.fields([{ name: 'deliveryProofImg' }, { name: 'signatureImg' }]), 
  (req, res, next) => {
    if (req.body.body) req.body = JSON.parse(req.body.body);
    next();
  },
  OrderController.updateParcelStatus
);


router.get(
  '/ongoing', 
  auth(USER_ROLE.user), 
  OrderController.getOngoingOrders
);
router.get(
  '/rider-ongoing', 
  auth('driver'), 
  OrderController.getRiderOngoingOrders
);

export const OrderRoutes = router;