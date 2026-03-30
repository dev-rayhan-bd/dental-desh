import QueryBuilder from '../../builder/QueryBuilder';
import { Support } from './support.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';


const getAllSupportTicketsFromDB = async (query: Record<string, unknown>) => {
  const supportQuery = new QueryBuilder(
    Support.find().populate('user', 'fullName image role'), 
    query
  )
    .search(['name', 'email', 'subject', 'message']) 
    .filter() 
    .sort('-createdAt') 
    .paginate();

  const result = await supportQuery.modelQuery;
  const meta = await supportQuery.countTotal();

  return { meta, result };
};

//(Action: Pending to Resolved)
const resolveTicketInDB = async (id: string) => {
  const ticket = await Support.findById(id);
  if (!ticket) {
    throw new AppError(httpStatus.NOT_FOUND, 'Support ticket not found!');
  }

  const result = await Support.findByIdAndUpdate(
    id,
    { status: 'resolved' },
    { new: true }
  );

  return result;
};

export const SupportService = {
  getAllSupportTicketsFromDB,
  resolveTicketInDB,
};