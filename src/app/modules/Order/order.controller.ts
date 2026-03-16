import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { OrderService } from './order.services';
import AppError from '../../errors/AppError';
import uploadImage from '../../middleware/upload';
import { sendNotification } from '../../utils/sendNotification';
import { Order } from './order.model';

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getAllOrdersFromDB(req.query);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'All orders retrieved', data: result });
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getMyOrdersFromDB(req.user.userId, req.query);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Your orders retrieved', data: result });
});

const trackOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.trackOrderByIDFromDB(req.params.trackingId as string);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Tracking data retrieved', data: result });
});

const getSingleOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getSingleOrderFromDB(req.params.id as string);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Order details retrieved', data: result });
});




// const updateParcelStatus = catchAsync(async (req: Request, res: Response) => {
//   const { id, index } = req.params;
//   const payload = { ...req.body };
// const riderId = req.user.userId;


//   if (payload.status === 'delivered') {
//     const files = req.files as { [fieldname: string]: Express.Multer.File[] };


//     if (!files?.deliveryProofImg || !files.deliveryProofImg[0]) {
//       throw new AppError(httpStatus.BAD_REQUEST, "Delivery proof image is required to complete delivery");
//     }

//     if (!files?.signatureImg || !files.signatureImg[0]) {
//       throw new AppError(httpStatus.BAD_REQUEST, "Customer signature is required to complete delivery");
//     }

//     payload.deliveryProofImg = await uploadImage(req, files.deliveryProofImg[0]);
//     payload.signatureImg = await uploadImage(req, files.signatureImg[0]);
//   }




//   // db update (Service Call)
//   const result = await OrderService.updateOrderStatusInDB(id as string, Number(index), payload);


// //for user
//   await sendNotification(
//     result?.user.toString() as string,
//     "Delivery Update 📦",
//     payload.message || `Status: ${payload.status}`,
//     "order",
//       result?.trackingId,           
//   payload.status 
//   );

//   //for rider
//   await sendNotification(
//     riderId,
//     "Update Successful!",
//     `You updated Order #${result?.trackingId} to ${payload.status}`,
//     "order"
//   );




//   // real time status update using socket

//   const io = req.app.get('io');


//   if (io && result) {
 
//     io.to(result.trackingId).emit('order-status-updated', {
//       status: result.status,
//       index: Number(index),
//       message: payload.message,
//       timeline: result.timeline,
//       dropOffs: result.dropOffs
//     });
//   }
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Status updated successfully',
//     data: result,
//   });
// });

const updateParcelStatus = catchAsync(async (req: Request, res: Response) => {
  const { id, index } = req.params;
  const payload = { ...req.body };
  const riderId = req.user.userId;


  if (payload.status === 'delivered') {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files?.deliveryProofImg || !files.deliveryProofImg[0]) {
      throw new AppError(httpStatus.BAD_REQUEST, "Delivery proof image is required to complete delivery");
    }

    if (!files?.signatureImg || !files.signatureImg[0]) {
      throw new AppError(httpStatus.BAD_REQUEST, "Customer signature is required to complete delivery");
    }

    payload.deliveryProofImg = await uploadImage(req, files.deliveryProofImg[0]);
    payload.signatureImg = await uploadImage(req, files.signatureImg[0]);
  }

  const updateResult = await OrderService.updateOrderStatusInDB(id as string, Number(index), payload);


  const result = await Order.findById(updateResult!._id)
    .populate('user')
    .populate('rider')
    .lean();

  if (!result) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to retrieve updated order");
  }


  await sendNotification(
    (result.user as any)._id.toString(),
    "Delivery Update 📦",
    payload.message || `Status: ${payload.status}`,
    "order",
    result.trackingId,
    payload.status
  );


  await sendNotification(
    riderId,
    "Update Successful!",
    `You updated Order #${result.trackingId} to ${payload.status}`,
    "order"
  );


  const io = req.app.get('io');
  if (io) {
    io.to(result.trackingId).emit('order-status-updated', {
      success: true,
      message: payload.message || `Your delivery is on the way.`,
      trackingId: result.trackingId,
      data: result 
    });
  }

 
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Status updated successfully',
    data: result,
  });
});


const getOngoingOrders = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  
  const result = await OrderService.getOngoingOrdersFromDB(userId as string, req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Ongoing orders retrieved successfully",
    data: result,
  });
});



export const OrderController = { getAllOrders, getMyOrders, trackOrder, getSingleOrder,updateParcelStatus,getOngoingOrders };