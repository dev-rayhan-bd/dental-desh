import QueryBuilder from '../../builder/QueryBuilder';
import { NotificationModel } from './notification.model';

const getMyNotificationsFromDB = async (userId: string, query: Record<string, unknown>) => {

  const notificationQuery = new QueryBuilder(
    NotificationModel.find({ user: userId }), 
    query
  )
    .search(['title', 'message']) 
    .filter() // type or isRead 
    .sort('createdAt')
    .paginate() 
    .fields();

  const result = await notificationQuery.modelQuery;
  const meta = await notificationQuery.countTotal();

  return {
    meta,
    result,
  };
};

export const NotificationService = {
  getMyNotificationsFromDB,
};