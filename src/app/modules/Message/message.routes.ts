import express from 'express';
import auth from '../../middleware/auth';
import { MessageController } from './message.controller';
import { USER_ROLE } from '../Auth/auth.constant';

const router = express.Router();


router.get(
  '/:trackingId', 
  auth(USER_ROLE.user, USER_ROLE.driver), 
  MessageController.getChatHistory
);

export const MessageRoutes = router;