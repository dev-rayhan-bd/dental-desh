import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { OrderService } from './order.services';

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

export const OrderController = { getAllOrders, getMyOrders, trackOrder, getSingleOrder };