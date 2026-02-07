import { Message } from './message.model';

const getChatHistoryFromDB = async (trackingId: string) => {

  return await Message.find({ trackingId }).sort({ createdAt: 1 });
};

export const MessageService = {
  getChatHistoryFromDB,
};