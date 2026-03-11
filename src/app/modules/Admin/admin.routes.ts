import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../Auth/auth.constant';
import { AdminController } from './admin.controller';

const router = express.Router();

router.get(
  '/dashboard-stats',
  auth(USER_ROLE.superAdmin),
  AdminController.getDashboardStats
);
router.patch(
  '/approve-rider/:id',
  auth(USER_ROLE.superAdmin), 
  AdminController.approveRider
);
export const AdminRoutes = router;