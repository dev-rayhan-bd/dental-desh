import { Types } from 'mongoose';



export interface IAddress {
  formattedAddress: string; //map address (House 32, Road 11, Dhanmondi, Dhaka 1209)
//   House No / Flat / Floor (Optional)
  houseNo?: string;   

  coordinates: {
    lat: number;
    lng: number;
  };
}




export interface IDropOff {
  receiverName: string;
  receiverPhone: string;
  receiverAddress: IAddress; 
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
  pickupLocation: IAddress;
  dropOffs: IDropOff[];
  status: 'pending' | 'req accepted' |'trip started'| 'percel picked' | 'delivered';
  timeline: ITimeline[];
  paymentInfo: {

    deliveryCharge: number;
    riderEarnings:number
  };
}