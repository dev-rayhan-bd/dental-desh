import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { SupportService } from './support.services';


const getAllTickets = catchAsync(async (req: Request, res: Response) => {
  const result = await SupportService.getAllSupportTicketsFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Support tickets retrieved successfully',
    data: result,
  });
});

const resolveTicket = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SupportService.resolveTicketInDB(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Ticket marked as resolved',
    data: result,
  });
});

export const SupportController = {
  getAllTickets,
  resolveTicket,
};