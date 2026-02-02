/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { NextFunction, Request, Response } from 'express';


import { USER_ROLE } from '../Auth/auth.constant';
import { upload } from '../../middleware/multer';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { RiderController } from './rider.controller';


const router = express.Router();




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
 
  auth(USER_ROLE.superAdmin),
  RiderController.getAllUser,
);

router.delete('/delete-profile',auth(USER_ROLE.superAdmin,USER_ROLE.user),RiderController.deleteProfile);






export const RiderRoutes = router;
