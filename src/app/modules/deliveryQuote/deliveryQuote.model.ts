import { Schema, model } from 'mongoose';
import { IDeliveryQuote } from './deliveryQuote.interface';

const dropOffSchema = new Schema({
  receiverName: { type: String, required: true },
  receiverPhone: { type: String, required: true },
  receiverAddress: { type: String, required: true },
  packageName: { type: String, required: true },
  quantity: { type: Number, required: true },
  weight: { type: String, required: true },
  status: { type: String, enum: ['pending', 'trip started', 'delivered'], default: 'pending' },
  deliveryProofImg: String,
  signatureImg: String,
  deliveredAt: Date,
});

const quoteSchema = new Schema<IDeliveryQuote>({
  trackingId: { type: String, required: true, unique: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rider: { type: Schema.Types.ObjectId, ref: 'User' },
  pickupLocation: { type: String, required: true },
  dropOffs: [dropOffSchema],
  status: { type: String, enum: ['pending', 'req accepted', 'percel picked', 'delivered'], default: 'pending' },
  timeline: [{ status: String, message: String, time: { type: Date, default: Date.now } }],
  paymentInfo: { totalDistance: String, charge: Number },
}, { timestamps: true });

export const DeliveryQuote = model<IDeliveryQuote>('DeliveryQuote', quoteSchema);