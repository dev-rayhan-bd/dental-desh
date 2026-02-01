import { Types } from 'mongoose';

export interface IDropOff {
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  packageName: string;
  quantity: number;
  weight: string;
  additionalDetails?: string;
}

export interface IDeliveryQuote {
  rider: Types.ObjectId; // Reference to Rider
  pickupLocation: string;
  dropOffs: IDropOff[]; // Supports destination 1, 2, 3...
  status: 'pending' | 'accepted' | 'in-transit' | 'delivered' | 'cancelled';
  totalCost?: number;
}