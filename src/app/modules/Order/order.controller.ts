import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { OrderService } from './order.services';

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  
  // Passes userId and query params (date, status, search, etc.) to service
  const result = await OrderService.getAllOrdersFromDB(userId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Orders retrieved successfully!',
    data: result,
  });
});

const trackOrder = catchAsync(async (req: Request, res: Response) => {
  const { trackingId } = req.params;
  const result = await OrderService.trackOrderByTrackingID(trackingId as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order tracking details',
    data: result,
  });
});

export const OrderController = { getMyOrders, trackOrder };