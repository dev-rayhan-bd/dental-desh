import { Schema, model } from 'mongoose';
import { IOrder } from './order.interface';


const addressSchema = new Schema({
  formattedAddress: { type: String, required: true },
  houseNo: { type: String },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
}, { _id: false });


const dropOffSchema = new Schema({
  receiverName: { type: String, required: true },
  receiverPhone: { type: String, required: true },
  receiverAddress: { type: addressSchema, required: true }, 
  packageName: { type: String, required: true },
  quantity: { type: Number, required: true },
  weight: { type: String, required: true },
   status: { 
    type: String, 
    enum: ['pending', 'trip started', 'delivered'],
    default: 'pending',
    trim: true 
  },
  deliveryProofImg: String,
  signatureImg: String,
  deliveredAt: Date,
});

const timelineSchema = new Schema({
  status: { type: String, required: true },
  message: { type: String, required: true },
  time: { type: Date, default: Date.now },
}, { _id: false });

const orderSchema = new Schema<IOrder>(
  {
    trackingId: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rider: { type: Schema.Types.ObjectId, ref: 'Rider' },
    pickupLocation: { type: addressSchema, required: true }, 
    dropOffs: [dropOffSchema],
    status: { 
    type: String, 
    enum: ['pending', 'req accepted', 'percel picked', 'delivered'], 
    default: 'pending',
    trim: true
  },
    timeline: [
 timelineSchema
    ],
     paymentInfo: {
    deliveryCharge: { type: Number, required: true },
    riderEarnings: { type: Number, default: 0 } ,
     riderPaymentStatus: { 
        type: String, 
        enum: ['pending', 'paid'], 
        default: 'pending' 
    },
  },
  
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Order = model<IOrder>('Order', orderSchema);