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

const updateStatusInDB = async (id: string, index: number, payload: any) => {
  const updateData: any = {
    [`dropOffs.${index}.status`]: payload.status,
    $push: { timeline: { status: payload.status, message: payload.message || `Parcel ${index} updated`, time: new Date() } }
  };

  if (payload.status === 'delivered') {
    updateData[`dropOffs.${index}.deliveryProofImg`] = payload.deliveryProofImg;
    updateData[`dropOffs.${index}.signatureImg`] = payload.signatureImg;
    updateData[`dropOffs.${index}.deliveredAt`] = new Date();
  }

  const result = await DeliveryQuote.findByIdAndUpdate(id, updateData, { new: true });
  

  if (result?.dropOffs.every(d => d.status === 'delivered')) {
    await DeliveryQuote.findByIdAndUpdate(id, { status: 'delivered' });
    const finalData = await DeliveryQuote.findById(id).lean();
    if (finalData) {
      const { _id, ...orderRest } = finalData;
      await Order.create({ ...orderRest, completedAt: new Date() });
      await DeliveryQuote.findByIdAndDelete(id);
    }
  }
  return result;
};

export const DeliveryQuoteService = {
  createQuoteIntoDB,
  getAllQuotesFromDB,
  getMyQuotesFromDB,
  getSingleQuoteFromDB,
  updateStatusInDB
};