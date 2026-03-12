import * as admin from 'firebase-admin';
import { NotificationModel } from '../modules/Notification/notification.model';
import { UserModel } from '../modules/User/user.model';
import config from '../config';

// Firebase Initialize
const serviceAccount = require('../../../firebase-admin-config.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const sendNotification = async (
  userId: string,
  title: string,
  message: string,
  type:string,
  trackingId?: string,
  deliveryStatus?: string
) => {
  try {

    await NotificationModel.create({
      user: userId,
      title,
      message,
     type,
      trackingId,
      deliveryStatus
    });

 
    const user = await UserModel.findById(userId);
    
    if (user && user.fcmToken) {
      const payload = {
        notification: {
          title,
          body: message,
        },
        token: user.fcmToken, 
      };
    try {
        await admin.messaging().send(payload);
        console.log('✅ Push notification sent successfully');
      } catch (fcmError: any) {
     
        console.error('⚠️ FCM Push failed (Invalid Token):', fcmError.message);
      }
   
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

export const sendNotificationToAdmins = async (
  title: string,
  message: string,
  type: string = 'general'
) => {
  try {

    const admins = await UserModel.find({ 
      role: { $in: ['admin', 'superAdmin'] } 
    });

    for (const admin of admins) {

      await sendNotification(admin._id.toString(), title, message, type);
    }
  } catch (error) {
    console.error('Error sending notification to admins:', error);
  }
};


export const sendNotificationToAllRiders = async (title: string, message: string, trackingId: string) => {
  try {

    const riders = await UserModel.find({ role: 'driver', status: 'in-progress' });

    for (const rider of riders) {
   
      await sendNotification(
        rider._id.toString(),
        title,
        message,
        "order",
        trackingId
      );
    }
  } catch (error) {
    console.error("❌ Global Rider Notification Error:", error);
  }
};