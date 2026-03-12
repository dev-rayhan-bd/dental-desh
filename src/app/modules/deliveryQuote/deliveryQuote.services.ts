import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { DeliveryQuote } from './deliveryQuote.model';
import { Order } from '../Order/order.model';

import QueryBuilder from '../../builder/QueryBuilder';
import { generateTrackingId } from '../../utils/generateTrackingId';
import { calculateDeliveryCharge } from '../../utils/calculateDeliveryCharge';
import { Rider } from '../rider/rider.model';

// const createQuoteIntoDB = async (payload: any) => {
//   payload.trackingId = generateTrackingId();
//   payload.paymentInfo = {

//     deliveryCharge: calculateDeliveryCharge(payload.dropOffs)
//   };
//   payload.timeline = [{ status: 'pending', message: 'Request placed', time: new Date() }];
//   return await DeliveryQuote.create(payload);
// };

const createQuoteIntoDB = async (payload: any) => {
  payload.trackingId = generateTrackingId();
  payload.paymentInfo = {
    deliveryCharge: calculateDeliveryCharge(payload.dropOffs)
  };
  payload.timeline = [{ status: 'pending', message: 'Request placed', time: new Date() }];


  const result = await DeliveryQuote.create(payload);

  

  const populatedResult = await DeliveryQuote.findById(result._id).populate('user');

  return populatedResult;
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


// const acceptJobInDB = async (quoteId: string, riderId: string) => {
//   const quote = await DeliveryQuote.findById(quoteId).lean();
//   if (!quote) throw new AppError(404, "Job not found or already accepted");

//  const deliveryCharge = quote.paymentInfo.deliveryCharge || 0;
//   const income = (deliveryCharge * 30) / 100;

//   const { _id, ...orderData } = quote;
//   const newOrder = await Order.create({
//     ...orderData,
//     rider: riderId,
//     status: 'req accepted',
//       paymentInfo: {
//       deliveryCharge: deliveryCharge,
//       riderEarnings: income 
//     },
//     timeline: [
//       ...quote.timeline,
//       { status: 'req accepted', message: 'Rider has accepted the job.', time: new Date() }
//     ]
//   });

//   await DeliveryQuote.findByIdAndDelete(quoteId);

//   return newOrder;
// };
const acceptJobInDB = async (quoteId: string, riderId: string) => {

  const rider = await Rider.findById(riderId);
  if (!rider?.isAvailable) {
    throw new AppError(400, "You are already on a trip or offline!");
  }

  const quote = await DeliveryQuote.findById(quoteId).lean();
  if (!quote) throw new AppError(404, "Job not found or already accepted");


  const deliveryCharge = quote.paymentInfo.deliveryCharge || 0;
  const income = (deliveryCharge * 30) / 100;

 
  const { _id, ...orderData } = quote;
  const newOrder = await Order.create({
    ...orderData,
    rider: riderId,
    status: 'req accepted',
    paymentInfo: { deliveryCharge, riderEarnings: income },
    timeline: [
      ...quote.timeline,
      { status: 'req accepted', message: 'Rider is on the way to pick up.', time: new Date() }
    ]
  });

 
  await Rider.findByIdAndUpdate(riderId, { isAvailable: false });

 
  await DeliveryQuote.findByIdAndDelete(quoteId);

  return newOrder;
};

export const DeliveryQuoteService = {
  createQuoteIntoDB,
  getAllQuotesFromDB,
  getMyQuotesFromDB,
  getSingleQuoteFromDB,

  acceptJobInDB
};