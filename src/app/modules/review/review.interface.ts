import { Types } from 'mongoose';

export interface IReview {
  user: Types.ObjectId;  
  rider: Types.ObjectId;  
  order: Types.ObjectId;  
  rating: number;         
  comment: string;       
}