import { IDeliveryQuote } from "../deliveryQuote/deliveryQuote.interface";

export interface IOrder extends IDeliveryQuote {
  completedAt: Date;
}

