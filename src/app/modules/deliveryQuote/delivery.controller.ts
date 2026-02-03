import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { DeliveryQuoteService } from './deliveryQuote.services';
import uploadImage from '../../middleware/upload';
import AppError from '../../errors/AppError';

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


const acceptJob = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const riderId = req.user.userId;
  const result = await DeliveryQuoteService.acceptJobInDB(id as string, riderId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Job accepted successfully!',
    data: result,
  });
});


const updateParcelStatus = catchAsync(async (req: Request, res: Response) => {
  const { id, index } = req.params;
  const payload = { ...req.body };


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


  const result = await DeliveryQuoteService.updateParcelStatusInDB(id as string, Number(index), payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Status updated successfully',
    data: result,
  });
});

export const DeliveryQuoteController = { createQuote, getAllQuotes, getMyQuotes, getSingleQuote, updateParcelStatus ,acceptJob};