import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { DeliveryQuoteService } from './deliveryQuote.services';
import uploadImage from '../../middleware/upload';
import AppError from '../../errors/AppError';
import { sendNotification } from '../../utils/sendNotification';

const createQuote = catchAsync(async (req: Request, res: Response) => {
  const result = await DeliveryQuoteService.createQuoteIntoDB({ ...req.body, user: req.user.userId });
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: 'Created', data: result });
});

const getAllQuotes = catchAsync(async (req: Request, res: Response) => {
  const result = await DeliveryQuoteService.getAllQuotesFromDB(req.query);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, data: result });
});

const getMyQuotes = catchAsync(async (req: Request, res: Response) => {
  const result = await DeliveryQuoteService.getMyQuotesFromDB(req.user.userId, req.query);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, data: result });
});

const getSingleQuote = catchAsync(async (req: Request, res: Response) => {
  const result = await DeliveryQuoteService.getSingleQuoteFromDB(req.params.id as string);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, data: result });
});


// const acceptJob = catchAsync(async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const riderId = req.user.userId;
//   const result = await DeliveryQuoteService.acceptJobInDB(id as string, riderId);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Job accepted successfully!',
//     data: result,
//   });
// });
const acceptJob = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const riderId = req.user.userId;
  
  const result = await DeliveryQuoteService.acceptJobInDB(id as string, riderId);

//user
  await sendNotification(
    result.user.toString(), 
    "Rider Assigned! 🏍️",
    `A rider has accepted your delivery request. Tracking ID: ${result.trackingId}`,
    "order"
  );
//for rider 
 await sendNotification(
    riderId,
    "Job Confirmed! ✅",
    `You have accepted Order #${result.trackingId}. Please proceed to pickup.`,
    "order"
  );



  const io = req.app.get('io');
  io.to(result.trackingId).emit('order-status-updated', {
    status: 'req accepted',
    message: 'Rider has accepted the job.',
    rider: result.rider,
    orderId: result._id 
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Job accepted successfully!',
    data: result,
  });
});



export const DeliveryQuoteController = { createQuote, getAllQuotes, getMyQuotes, getSingleQuote,acceptJob};