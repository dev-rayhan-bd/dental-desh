import { Schema, model } from 'mongoose';
import { IOrder } from './order.interface';

const dropOffSchema = new Schema({
  receiverName: { type: String, required: true },
  receiverPhone: { type: String, required: true },
  receiverAddress: { type: String, required: true },
  packageName: { type: String, required: true },
  quantity: { type: Number, required: true },
  weight: { type: String, required: true },
  additionalDetails: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'trip started', 'delivered'], 
    default: 'delivered' 
  },
  deliveryProofImg: { type: String },
  signatureImg: { type: String },
  deliveredAt: { type: Date },
});


const timelineSchema = new Schema({
  status: { type: String, required: true },
  message: { type: String, required: true },
  time: { type: Date, default: Date.now },
});


const orderSchema = new Schema<IOrder>(
  {
    trackingId: { 
      type: String, 
      required: true, 
      unique: true 
    },
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    rider: { 
      type: Schema.Types.ObjectId, 
      ref: 'Rider'
    },
    pickupLocation: { 
      type: String, 
      required: true 
    },
    dropOffs: [dropOffSchema],
    status: { 
      type: String, 
      enum: ['pending', 'req accepted', 'percel picked', 'delivered'], 
      default: 'delivered' 
    },
    timeline: [timelineSchema],
    paymentInfo: {
      totalDistance: { type: String },
      charge: { type: Number },
    },
    completedAt: { 
      type: Date, 
      default: Date.now 
    },
  },
  {
    timestamps: true, 
  }
);


export const Order = model<IOrder>('Order', orderSchema);