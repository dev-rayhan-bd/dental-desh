import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../Auth/auth.constant';
import { SupportController } from './support.controller';

const router = express.Router();

router.get(
  '/',
  auth(USER_ROLE.superAdmin),
  SupportController.getAllTickets
);

router.patch(
  '/resolve/:id',
  auth(USER_ROLE.superAdmin),
  SupportController.resolveTicket
);

export const SupportRoutes = router;