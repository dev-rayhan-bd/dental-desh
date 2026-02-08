import { Message } from './message.model';

const getChatHistoryFromDB = async (trackingId: string) => {
console.log("tracking id---->",trackingId);
  return await Message.find({trackingId}).sort({ createdAt: 1 });
};

export const MessageService = {
  getChatHistoryFromDB,
};