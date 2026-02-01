import { Schema, model } from 'mongoose';
import { IDeliveryQuote, IDropOff } from './deliveryQuote.interface';

const dropOffSchema = new Schema<IDropOff>({
  receiverName: { type: String, required: true },
  receiverPhone: { type: String, required: true },
  receiverAddress: { type: String, required: true },
  packageName: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  weight: { type: String, required: true },
  additionalDetails: { type: String },
});

const deliveryQuoteSchema = new Schema<IDeliveryQuote>(
  {
    rider: {
      type: Schema.Types.ObjectId,
      ref: 'Rider',
      required: true,
    },
    pickupLocation: {
      type: String,
      required: true,
    },
    dropOffs: {
      type: [dropOffSchema],
      validate: [(val:any) => val.length > 0, 'At least one drop-off destination is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in-transit', 'delivered', 'cancelled'],
      default: 'pending',
    },
    totalCost: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

export const DeliveryQuote = model<IDeliveryQuote>('DeliveryQuote', deliveryQuoteSchema);