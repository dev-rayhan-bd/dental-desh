import { Order } from './order.model';
import QueryBuilder from '../../builder/QueryBuilder';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';


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
  const result = await Order.findOne({ trackingId }).populate('rider user');
  if (!result) throw new AppError(httpStatus.NOT_FOUND, "Order not found with this tracking ID");
  return result;
};


const getSingleOrderFromDB = async (id: string) => {
  const result = await Order.findById(id).populate('rider user');
  if (!result) throw new AppError(httpStatus.NOT_FOUND, "Order details not found");
  return result;
};

export const OrderService = {
  getAllOrdersFromDB,
  getMyOrdersFromDB,
  trackOrderByIDFromDB,
  getSingleOrderFromDB
};