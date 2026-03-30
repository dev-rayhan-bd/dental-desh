/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import nodemailer, { SendMailOptions, SentMessageInfo } from 'nodemailer';  
import httpStatus from 'http-status';

import AppError from '../../errors/AppError';
import config from '../../config';
import { sendNotificationToAdmins } from '../../utils/sendNotification';
import { Support } from '../support/support.model';
import { UserModel } from '../User/user.model';

const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subject, email, message } = req.body;

    if (!subject || !email || !message) {
      res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'All fields are required.',
      });
      return;
    }

   const userId = req.user?.userId; 
     let finalName = "guestName";
    let finalEmail = "guestEmail";


    if (userId) {
      const user = await UserModel.findById(userId).select('fullName email');
      if (user) {
        finalName = user.fullName;
        finalEmail = user.email;
      }
    }
  await Support.create({
      user: userId || null,
      name: finalName,  
      email: finalEmail,
      subject,
      message
    });

    // create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.SMTP_USER, // your app's email (sender)
        pass: config.SMTP_PASS,
      },
    });

    const mailOptions: SendMailOptions = {
      from: `<${config.SMTP_USER}>`,
      to: process.env.CONTACT_RECEIVER_EMAIL || config.SMTP_USER,
      subject:` ${subject}`,
      text: `
You received a new message from your app contact form:

Email: ${email}

Message:
${message}
      `,
      // replyTo: email, 
    };

    const info: SentMessageInfo = await transporter.sendMail(mailOptions);

    console.log('Message sent: %s', info.messageId);

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Message sent successfully.',
    });
    await sendNotificationToAdmins(
  'New Contact Inquiry 📧',
  `You have a new message from ${email}.`,
  'general'
);
  } catch (error: any) {
    console.error('Error sending email:', error);
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Error sending email.');
  }
};

export const contactControllers = { sendMessage };
