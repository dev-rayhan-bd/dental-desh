import express, { NextFunction, Request, Response } from 'express';


import { AuthControllers } from './auth.controller';


import { USER_ROLE } from './auth.constant';

import { AuthValidation } from './authValidation';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
import { upload } from '../../middleware/multer';
import { RiderValidation } from '../rider/rider.validation';

const router = express.Router();

router.post(
  '/register',
 upload.single('image'),
  (req: Request, res: Response, next: NextFunction) => {
    // console.log("req data--->",req.body.body);
    if (req.body) {
      req.body = JSON.parse(req.body.body);
    }
    next();
  },


  AuthControllers.registerUser,
);



router.post(
  '/register-rider',

  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'drivingLicense', maxCount: 1 },
    { name: 'vehicleImage', maxCount: 1 },
  ]),
  (req: Request, res: Response, next: NextFunction) => {
    // console.log("req data--->",req.files);

    if (req.body) {
      // console.log("req data inside condition--->",req.body.body);
      req.body = JSON.parse(req.body.body);
    }
    next();
  },


  validateRequest(RiderValidation.createRiderZodSchema), 
  AuthControllers.registerRider
);





router.post(
  '/resendOtp',
  AuthControllers.resendOtp,
);
router.post('/login',
    validateRequest(AuthValidation.loginValidationSchema),
    AuthControllers.userLogin
);
router.post('/admin/login',
    validateRequest(AuthValidation.AdminloginValidationSchema),
    AuthControllers.AdminLogin
);
router.post('/changePassword',
  
    validateRequest(AuthValidation.changePasswordValidationSchema),
    auth(USER_ROLE.user,USER_ROLE.superAdmin),
    AuthControllers.changePassword
)
router.post(
  '/refresh-token',
  validateRequest(AuthValidation.refreshTokenValidationSchema),
  AuthControllers.refreshToken,
);
router.post(
  '/forgotPass',
  validateRequest(AuthValidation.forgotPasswordSchema),
  AuthControllers.forgotPassword,
);
router.post(
  '/resetPass',
  validateRequest(AuthValidation.resetPasswordValidationSchema),
  AuthControllers.resetPassword,
);

router.post(
  '/verifyOtp',
  validateRequest(AuthValidation.verifyOtpSchema),
  AuthControllers.verifyYourOTP,
);
router.post(
  '/regOtpVerify',
  validateRequest(AuthValidation.verifyOtpSchema),
  AuthControllers.VerifyOtpForRegistration,
);


export const AuthRoutes = router;
