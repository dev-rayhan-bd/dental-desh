import express from 'express';
import auth from '../../middleware/auth';
import { MessageController } from './message.controller';
import { USER_ROLE } from '../Auth/auth.constant';
import { upload } from '../../middleware/multer';
import uploadImage from '../../middleware/upload';

const router = express.Router();


router.get(
  '/:trackingId', 
  auth(USER_ROLE.user, USER_ROLE.driver), 
  MessageController.getChatHistory
);

export const MessageRoutes = router;


router.post('/upload', upload.single('image'), async (req, res) => {
  const imageUrl = await uploadImage(req); 
  res.json({ success: true, url: imageUrl });
});