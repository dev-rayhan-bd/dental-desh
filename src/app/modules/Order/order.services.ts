import { Order } from './order.model';
import QueryBuilder from '../../builder/QueryBuilder';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { DeliveryQuote } from '../deliveryQuote/deliveryQuote.model';
import { Rider } from '../rider/rider.model';








 const applyOrderFilters = (query: Record<string, unknown>) => {
  const filterObj: any = { ...query };


   if (query.date) {
    const dateStr = query.date as string;
    
    
    const start = new Date(dateStr);
    start.setUTCHours(0, 0, 0, 0);

  
    const end = new Date(dateStr);
    end.setUTCHours(23, 59, 59, 999);

    filterObj.createdAt = { $gte: start, $lte: end };
    delete filterObj.date;
  }

  //  (Weekly/Monthly)
  if (query.range === 'weekly') {
    filterObj.createdAt = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    delete filterObj.range;
  } else if (query.range === 'monthly') {
    filterObj.createdAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    delete filterObj.range;
  }

  // (Current/Upcoming)
  if (query.status === 'current') {
    filterObj.status = { $in: ['req accepted', 'percel picked', 'trip started'] };
  } else if (query.status === 'upcoming') {
    filterObj.status = 'pending';
  }

  return filterObj;
};


const getAllOrdersFromDB = async (query: Record<string, unknown>) => {
  const filteredQuery = applyOrderFilters(query);

  const orderQuery = new QueryBuilder(
    Order.find().populate('user rider'), 
    filteredQuery
  )
    .search(['trackingId', 'pickupLocation.formattedAddress'])
    .filter()
    .sort('-createdAt')
    .paginate()
    .fields();

  const result = await orderQuery.modelQuery;
  const meta = await orderQuery.countTotal();
  return { meta, result };
};


const getMyOrdersFromDB = async (userId: string, query: Record<string, unknown>) => {

  const filteredQuery = { ...applyOrderFilters(query), user: userId };

  const orderQuery = new QueryBuilder(
    Order.find().populate('user').populate('rider'), 
    filteredQuery
  )
    .search(['trackingId'])
    .filter()
    .sort('-createdAt')
    .paginate()
    .fields();

  const result = await orderQuery.modelQuery;
  const meta = await orderQuery.countTotal();
  return { meta, result };
};


// const getAllOrdersFromDB = async (query: Record<string, unknown>) => {
//   const orderQuery = new QueryBuilder(Order.find().populate('user rider'), query)
//     .search(['trackingId', 'pickupLocation.formattedAddress'])
//     .filter()
//     .sort()
//     .paginate()
//     .fields();

//   const result = await orderQuery.modelQuery;
//   const meta = await orderQuery.countTotal();
//   return { meta, result };
// };

// const getMyOrdersFromDB = async (userId: string, query: Record<string, unknown>) => {
//   const orderQueryObj: any = { ...query, user: userId };

 
//   if (query.date) {
//     const start = new Date(query.date as string);
//     const end = new Date(query.date as string);
//     end.setHours(23, 59, 59, 999);
//     orderQueryObj.createdAt = { $gte: start, $lte: end };
//     delete orderQueryObj.date;
//   }

//   const orderQuery = new QueryBuilder(Order.find().populate('rider'), orderQueryObj)
//     .search(['trackingId'])
//     .filter()
//     .sort()
//     .paginate();

//   const result = await orderQuery.modelQuery;
//   const meta = await orderQuery.countTotal();
//   return { meta, result };
// };



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




const updateOrderStatusInDB = async (orderId: string, index: number, payload: any) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError(404, "Order not found");

 if (index === -1) {

    if (payload.status === 'delivered') {
      if (order.status !== 'percel picked' && order.status !== 'trip started') {
        throw new AppError(400, "Cannot mark as delivered globally. Parcels must be picked up first!");
      }
    }}


  if (index !== -1 && payload.status === 'trip started') {

    if (order.status !== 'percel picked') {
      throw new AppError(400, "You must pick up all parcels from the sender before starting a trip.");
    }
  }


  if (index === -1 && payload.status === 'percel picked') {

    if (order.status !== 'req accepted') {
      throw new AppError(400, "You cannot pick up parcels until the job is accepted.");
    }
  }


  if (index !== -1 && payload.status === 'delivered') {

    if (order.dropOffs[index].status !== 'trip started') {
      throw new AppError(400, "You must start the trip for this parcel before marking it as delivered.");
    }
  }





if (index === -1) {
 
    if (order.status === payload.status) {
      throw new AppError(httpStatus.BAD_REQUEST, `Order is already marked as ${payload.status}`);
    }
  } else {
  
    const targetParcel = order.dropOffs[index];
    if (!targetParcel) throw new AppError(404, "Parcel not found at this index");
    
    if (targetParcel.status === payload.status) {
      throw new AppError(httpStatus.BAD_REQUEST, `This parcel is already marked as ${payload.status}`);
    }
  }

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

  const result = await Order.findByIdAndUpdate(orderId, updateFields, { 
      new: true, 
      runValidators: true 
    });



  const isAllDelivered = result?.dropOffs.every(d => d.status === 'delivered');
   if (isAllDelivered && result?.status !== ('delivered' as string)) {
    const deliveryCharge = result?.paymentInfo.deliveryCharge || 0;
    const income = (deliveryCharge * 30) / 100;

    const finalizedOrder = await Order.findByIdAndUpdate(
      orderId, 
      { 
        $set: { 
          status: 'delivered', 
          completedAt: new Date(),
          "paymentInfo.riderEarnings": income 
        } 
      },
      { new: true }
    );

    if (finalizedOrder?.rider) {
      await Rider.findByIdAndUpdate(finalizedOrder.rider, {
        $inc: { 
          wallet: income, 
          totalEarnings: income, 
          totalTrips: 1 
        },
       $set: { isAvailable: true }
      });
      console.log(`💰 Rider ${finalizedOrder.rider} earned: ${income}`);
    }
    return finalizedOrder;
  }


  return result;
};

const getOngoingOrdersFromDB = async (userId: string, query: Record<string, unknown>) => {

  let filteredQuery = applyOrderFilters(query);


  if (!query.status) {
    filteredQuery.status = { $in: ['req accepted', 'percel picked', 'trip started'] };
  }


  filteredQuery.user = userId;

  const ongoingQuery = new QueryBuilder(
    Order.find().populate('rider user'), 
    filteredQuery
  )
    .search(['trackingId', 'pickupLocation.formattedAddress'])
    .filter()
    .sort('-createdAt')
    .paginate()
    .fields();

  const result = await ongoingQuery.modelQuery;
  const meta = await ongoingQuery.countTotal();

  return { meta, result };
};


const getRiderOngoingOrdersFromDB = async (riderId: string, query: Record<string, unknown>) => {

  let filteredQuery = applyOrderFilters(query);

  filteredQuery.rider = riderId;
  filteredQuery.status = { $in: ['req accepted', 'percel picked', 'trip started'] };


  const riderOngoingQuery = new QueryBuilder(
    Order.find().populate('user'), 
    filteredQuery
  )
    .search(['trackingId', 'pickupLocation.formattedAddress']) 
    .filter()  
    .sort('-createdAt') 
    .paginate()  
    .fields();

  const result = await riderOngoingQuery.modelQuery;
  const meta = await riderOngoingQuery.countTotal();

  return { meta, result };
};

export const OrderService = {
  getAllOrdersFromDB,
  getMyOrdersFromDB,
  trackOrderByIDFromDB,
  getSingleOrderFromDB,
  updateOrderStatusInDB,getOngoingOrdersFromDB,getRiderOngoingOrdersFromDB
};