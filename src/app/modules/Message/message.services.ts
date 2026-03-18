import QueryBuilder from '../../builder/QueryBuilder';
import { Message } from './message.model';

const getChatHistoryFromDB = async (trackingId: string, query: Record<string, unknown>) => {

  const messageQuery = new QueryBuilder(
    Message.find({ trackingId })
      .populate('sender', 'fullName email contact image')
      .populate('receiver', 'fullName email contact image'),
    query
  )
    .filter()
    .sort() 
    .paginate()
    .fields();

  const result = await messageQuery.modelQuery;
  const meta = await messageQuery.countTotal();

  return { meta, result };
};

export const MessageService = {
  getChatHistoryFromDB,
};