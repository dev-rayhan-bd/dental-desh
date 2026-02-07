import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { MessageService } from './message.services';

const getChatHistory = catchAsync(async (req: Request, res: Response) => {
  const { trackingId } = req.params;
  const result = await MessageService.getChatHistoryFromDB(trackingId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Chat history retrieved successfully',
    data: result,
  });
});

export const MessageController = {
  getChatHistory,
};