import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { DeliveryQuote } from './deliveryQuote.model';
import { Order } from '../Order/order.model';

import QueryBuilder from '../../builder/QueryBuilder';
import { generateTrackingId } from '../../utils/generateTrackingId';
import { calculateDeliveryCharge } from '../../utils/calculateDeliveryCharge';

const createQuoteIntoDB = async (payload: any) => {
  payload.trackingId = generateTrackingId();
  payload.paymentInfo = {

    deliveryCharge: calculateDeliveryCharge(payload.dropOffs)
  };
  payload.timeline = [{ status: 'pending', message: 'Request placed', time: new Date() }];
  return await DeliveryQuote.create(payload);
};


const getAllQuotesFromDB = async (query: Record<string, unknown>) => {
  const quoteQuery = new QueryBuilder(DeliveryQuote.find().populate('user rider'), query)
    .search(['trackingId', 'pickupLocation.formattedAddress'])
    .filter().sort().paginate();
  const result = await quoteQuery.modelQuery;
  const meta = await quoteQuery.countTotal();
  return { meta, result };
};


const getMyQuotesFromDB = async (userId: string, query: Record<string, unknown>) => {
  const quoteQuery = new QueryBuilder(DeliveryQuote.find({ user: userId }).populate('rider'), query)
    .filter().sort().paginate();
  const result = await quoteQuery.modelQuery;
  const meta = await quoteQuery.countTotal();
  return { meta, result };
};

const getSingleQuoteFromDB = async (id: string) => {
  const result = await DeliveryQuote.findById(id).populate('user rider');
  if (!result) throw new AppError(httpStatus.NOT_FOUND, "Quote not found");
  return result;
};
// updateParcelStatusInDB
const updateParcelStatusInDB = async (quoteId: string, index: number, payload: any) => {
  const quote = await DeliveryQuote.findById(quoteId);
  if (!quote) throw new AppError(httpStatus.NOT_FOUND, "Quote not found");


  if (index === -1) {
    const result = await DeliveryQuote.findByIdAndUpdate(
      quoteId,
      {
        $set: { status: payload.status },
        $push: { 
          timeline: { 
            status: payload.status, 
            message: payload.message || `Order status updated to ${payload.status}`, 
            time: new Date() 
          } 
        }
      },
      { new: true }
    );
    return result;
  }

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

export const DeliveryQuoteService = {
  createQuoteIntoDB,
  getAllQuotesFromDB,
  getMyQuotesFromDB,
  getSingleQuoteFromDB,
  updateParcelStatusInDB
};