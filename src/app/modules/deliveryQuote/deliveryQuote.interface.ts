import { Types } from 'mongoose';

export interface IDropOff {
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  packageName: string;
  quantity: number;
  weight: string;
  status: 'pending' | 'trip started' | 'delivered';
  deliveryProofImg?: string;
  signatureImg?: string;
  deliveredAt?: Date;
}

export interface ITimeline {
  status: string;
  message: string;
  time: Date;
}

export interface IDeliveryQuote {
  trackingId: string;
  user: Types.ObjectId;
  rider?: Types.ObjectId;
  pickupLocation: string;
  dropOffs: IDropOff[];
  status: 'pending' | 'req accepted' | 'percel picked' | 'delivered';
  timeline: ITimeline[];
  paymentInfo: {
    totalDistance: string;
    charge: number;
  };
}