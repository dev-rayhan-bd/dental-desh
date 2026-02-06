import { Order } from './order.model';
import QueryBuilder from '../../builder/QueryBuilder';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { DeliveryQuote } from '../deliveryQuote/deliveryQuote.model';
import { Rider } from '../rider/rider.model';


const getAllOrdersFromDB = async (query: Record<string, unknown>) => {
  const orderQuery = new QueryBuilder(Order.find().populate('user rider'), query)
    .search(['trackingId', 'pickupLocation.formattedAddress'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await orderQuery.modelQuery;
  const meta = await orderQuery.countTotal();
  return { meta, result };
};

const getMyOrdersFromDB = async (userId: string, query: Record<string, unknown>) => {
  const orderQueryObj: any = { ...query, user: userId };

 
  if (query.date) {
    const start = new Date(query.date as string);
    const end = new Date(query.date as string);
    end.setHours(23, 59, 59, 999);
    orderQueryObj.createdAt = { $gte: start, $lte: end };
    delete orderQueryObj.date;
  }




  const orderQuery = new QueryBuilder(Order.find().populate('rider'), orderQueryObj)
    .search(['trackingId'])
    .filter()
    .sort()
    .paginate();

  const result = await orderQuery.modelQuery;
  const meta = await orderQuery.countTotal();
  return { meta, result };
};



const trackOrderByIDFromDB = async (trackingId: string) => {

  const result = await Order.findOne({ trackingId })
    .populate('rider', 'fullName image contact')
    .select('trackingId status timeline rider ');

  if (!result) throw new AppError(404, "Invalid Tracking ID");
  return result;
};


const getSingleOrderFromDB = async (id: string) => {
  const result = await Order.findById(id).populate('rider user');
  if (!result) throw new AppError(httpStatus.NOT_FOUND, "Order details not found");
  return result;
};




// const updateOrderStatusInDB = async (orderId: string, index: number, payload: any) => {
//   const order = await Order.findById(orderId);
//   if (!order) throw new AppError(404, "Order not found");


//   if (index === -1) {
//     return await Order.findByIdAndUpdate(
//       orderId,
//       {
//         $set: { status: payload.status },
//         $push: { timeline: { status: payload.status, message: payload.message, time: new Date() } }
//       },
//       { new: true }
//     );
//   }

//   //  (trip started, delivered)
//   const updateFields: any = {
//     [`dropOffs.${index}.status`]: payload.status,
//     $push: { timeline: { status: payload.status, message: payload.message, time: new Date() } }
//   };

//   if (payload.status === 'delivered') {
//     updateFields[`dropOffs.${index}.deliveryProofImg`] = payload.deliveryProofImg;
//     updateFields[`dropOffs.${index}.signatureImg`] = payload.signatureImg;
//     updateFields[`dropOffs.${index}.deliveredAt`] = new Date();
//   }

//   const result = await Order.findByIdAndUpdate(orderId, updateFields, { new: true });


//   if (result?.dropOffs.every(d => d.status === 'delivered')) {
//     await Order.findByIdAndUpdate(orderId, { status: 'delivered', completedAt: new Date() });
//   }

//   return result;
// };


const updateOrderStatusInDB = async (orderId: string, index: number, payload: any) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError(404, "Order not found");

  // ১. নির্দিষ্ট পার্সেল বা গ্লোবাল স্ট্যাটাস আপডেট লজিক
  const updateFields: any = {
    $push: { timeline: { status: payload.status, message: payload.message, time: new Date() } }
  };

  if (index === -1) {
    updateFields.$set = { status: payload.status };
  } else {
    updateFields[`dropOffs.${index}.status`] = payload.status;
    if (payload.status === 'delivered') {
      updateFields[`dropOffs.${index}.deliveryProofImg`] = payload.deliveryProofImg;
      updateFields[`dropOffs.${index}.signatureImg`] = payload.signatureImg;
      updateFields[`dropOffs.${index}.deliveredAt`] = new Date();
    }
  }

  const result = await Order.findByIdAndUpdate(orderId, updateFields, { new: true });


  const isAllDelivered = result?.dropOffs.every(d => d.status === 'delivered');
  
  if (isAllDelivered && result?.status !== 'delivered') {

    const finalizedOrder = await Order.findByIdAndUpdate(
      orderId, 
      { status: 'delivered', completedAt: new Date() },
      { new: true }
    );

    //30% rider income
    if (finalizedOrder?.rider) {
      const deliveryCharge = finalizedOrder.paymentInfo.deliveryCharge || 0;
      const income = (deliveryCharge * 30) / 100; 

      await Rider.findByIdAndUpdate(finalizedOrder.rider, {
        $inc: { 
          wallet: income, 
          totalEarnings: income, 
          totalTrips: 1 
        }
      });
      console.log(`💰 Rider ${finalizedOrder.rider} earned: ${income}`);
    }
  }

  return result;
};



export const OrderService = {
  getAllOrdersFromDB,
  getMyOrdersFromDB,
  trackOrderByIDFromDB,
  getSingleOrderFromDB,
  updateOrderStatusInDB
};