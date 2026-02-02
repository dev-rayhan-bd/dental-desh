import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { DeliveryQuoteService } from './deliveryQuote.services';
import uploadImage from '../../middleware/upload';

const updateParcelStatus = catchAsync(async (req: Request, res: Response) => {
  const { id, index } = req.params;
  const { status, message } = req.body;
  const payload: any = { status, message };

  if (status === 'delivered') {
    const files = req.files as any;
    if (files?.deliveryProofImg) {
        payload.deliveryProofImg = await uploadImage(req, files.deliveryProofImg[0]);
    }
    if (files?.signatureImg) {
        payload.signatureImg = await uploadImage(req, files.signatureImg[0]);
    }
  }

  const result = await DeliveryQuoteService.updateParcelStatusInDB(id as string, Number(index), payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Status updated successfully',
    data: result,
  });
});

export const DeliveryQuoteController = { updateParcelStatus };