/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { NextFunction, Request, Response } from 'express';


import { USER_ROLE } from '../Auth/auth.constant';
import { upload } from '../../middleware/multer';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { RiderController } from './rider.controller';
import { RiderValidation } from './rider.validation';


const router = express.Router();


router.patch(
  '/update-profile',
  auth('driver'),
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'drivingLicense', maxCount: 1 },
    { name: 'vehicleImage', maxCount: 1 },
  ]),
  (req, res, next) => {
    if (req.body.body) req.body = JSON.parse(req.body.body);
    next();
  },
  validateRequest(RiderValidation.updateRiderProfileZodSchema),
  RiderController.updateProfile
);

router.get(
  '/my-profile',
 
  auth(USER_ROLE.driver),
 RiderController.getMyProfile,
);
router.get(
  '/single/:id',
 

  RiderController.getSingleProfile,
);
router.get(
  '/all',
  auth(USER_ROLE.superAdmin,USER_ROLE.driver,USER_ROLE.user),
  RiderController.getAllUser,
);
 


router.delete('/delete-profile',auth(USER_ROLE.superAdmin,USER_ROLE.user),RiderController.deleteProfile);


router.patch(
  '/toggle-availability',
  auth('driver'), 
  RiderController.toggleStatus
);

router.get(
  '/order-history',
  auth(USER_ROLE.driver), 
  RiderController.getOrderHistory
);

router.get(
  '/my-wallet',
  auth('driver'), 
  RiderController.getMyWallet
);

export const RiderRoutes = router;
