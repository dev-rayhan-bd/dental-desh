/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';


import { contactControllers } from './contact.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../Auth/auth.constant';



const router = express.Router();


    
router.post('/send-message',auth(USER_ROLE.driver,USER_ROLE.user),contactControllers.sendMessage)


export const ContactRoutes = router;
