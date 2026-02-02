import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { DeliveryQuote } from './deliveryQuote.model';
import { Order } from '../Order/order.model';
import { generateTrackingId } from '../../utils/generateTrackingId';
import { IDeliveryQuote } from './deliveryQuote.interface';




const createDeliveryQuoteIntoDB = async (payload: Partial<IDeliveryQuote>) => {

  payload.trackingId = generateTrackingId();


  payload.timeline = [
    {
      status: 'pending',
      message: 'Your delivery request has been placed and is waiting for rider acceptance.',
      time: new Date(),
    },
  ];


  const result = await DeliveryQuote.create(payload);
  return result;
};







const updateParcelStatusInDB = async (quoteId: string, index: number, payload: any) => {
  const quote = await DeliveryQuote.findById(quoteId);
  if (!quote) throw new AppError(httpStatus.NOT_FOUND, "Quote not found");

  const updateFields: any = {
    [`dropOffs.${index}.status`]: payload.status,
    $push: { 
      timeline: { 
        status: payload.status, 
        message: payload.message || `Parcel ${index + 1} ${payload.status}`, 
        time: new Date() 
      } 
    }
  };

  if (payload.status === 'delivered') {
    updateFields[`dropOffs.${index}.deliveryProofImg`] = payload.deliveryProofImg;
    updateFields[`dropOffs.${index}.signatureImg`] = payload.signatureImg;
    updateFields[`dropOffs.${index}.deliveredAt`] = new Date();
  }

  const result = await DeliveryQuote.findByIdAndUpdate(quoteId, updateFields, { new: true });

 
  const isAllDelivered = result?.dropOffs.every(d => d.status === 'delivered');
  if (isAllDelivered) {
    await DeliveryQuote.findByIdAndUpdate(quoteId, { status: 'delivered' });
    const finalData = await DeliveryQuote.findById(quoteId).lean();
    
    if (finalData) {
      const { _id, ...orderData } = finalData;
      await Order.create({ ...orderData, completedAt: new Date() });
      await DeliveryQuote.findByIdAndDelete(quoteId);
    }
  }
  return result;
};

export const DeliveryQuoteService = { createDeliveryQuoteIntoDB,updateParcelStatusInDB };