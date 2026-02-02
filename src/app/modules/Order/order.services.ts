import QueryBuilder from '../../builder/QueryBuilder';
import { Order } from './order.model';

const getAllOrdersFromDB = async (userId: string, query: Record<string, unknown>) => {

  const orderQueryObj: any = { ...query, user: userId };

  if (query.date) {
    const start = new Date(query.date as string);
    const end = new Date(query.date as string);
    end.setHours(23, 59, 59, 999);
    orderQueryObj.createdAt = { $gte: start, $lte: end };
    delete orderQueryObj.date;
  }


  if (query.status === 'current') {
    orderQueryObj.status = { $in: ['req accepted', 'percel picked', 'trip started'] };
  } else if (query.status === 'upcoming') {
    orderQueryObj.status = 'pending';
  }


  const orderQuery = new QueryBuilder(
    Order.find().populate('rider').populate('user'), 
    orderQueryObj
  )
    .search(['trackingId'])
    .filter()
    .sort() 
    .paginate()
    .fields();

  const result = await orderQuery.modelQuery;
  const meta = await orderQuery.countTotal();

  return { meta, result };
};
const trackOrderByTrackingID = async (trackingId: string) => {

  return await Order.findOne({ trackingId }).populate('rider');
};

export const OrderService = { getAllOrdersFromDB, trackOrderByTrackingID };