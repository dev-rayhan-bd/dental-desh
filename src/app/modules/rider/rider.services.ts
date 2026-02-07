/* eslint-disable @typescript-eslint/no-explicit-any */

import AppError from "../../errors/AppError";

import httpStatus from 'http-status';

import QueryBuilder from "../../builder/QueryBuilder";
import { Rider } from "./rider.model";
import { Order } from "../Order/order.model";
import { TUser } from "../User/user.interface";




const getMyProfileFromDB = async (id: string, ) => {
  const result = await Rider.findById(id);

  return result;
};
const getSingleProfileFromDB = async (id: string, ) => {
  const result = await Rider.findById(id);

  return result;
};


const deletePrifileFromDB = async (id: string) => {
  const event = await Rider.findByIdAndDelete(id);

  if (!event) {
    throw new AppError(httpStatus.NOT_FOUND, 'Rider not found!');
  }

  return event; // return deleted user if neededd
};
const deleteUserFromDB = async (id: string) => {
  const event = await Rider.findByIdAndDelete(id);

  if (!event) {
    throw new AppError(httpStatus.NOT_FOUND, 'Rider not found!');
  }

  return event; // return deleted user if neededd
};
const getAllUserFromDB = async (query: Record<string, unknown>) => {
  const queryBuilder = new QueryBuilder(Rider.find(), query);
  queryBuilder.search(["fullName", "email", "role"]).filter().sort().paginate();
  const result = await queryBuilder.modelQuery;
  const meta = await queryBuilder.countTotal();

  return { meta, result };
};


const getNearbyRidersFromDB = async (lat: number, lng: number) => {
  const riders = await Rider.find({
    isAvailable: true, // online rider
    lastLocation: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: 5000, // 5000 mtr or 5 km
      },
    },
  }).select('-password -verification -fcmToken -__v');

  return riders;
};

const getRiderOrderHistory = async (riderId: string) => {

  const result = await Order.find({ rider: riderId, status: 'delivered' })
    .sort({ createdAt: -1 });

  return result;
};



const toggleAvailabilityInDB = async (riderId: string) => {
  const rider = await Rider.findById(riderId);
  if (!rider) {
    throw new AppError(404, "Rider not found!");
  }


  const result = await Rider.findByIdAndUpdate(
    riderId,
    { isAvailable: !rider.isAvailable },
    { new: true }
  );

  return result;
};


const getRiderWalletFromDB = async (riderId: string) => {

  const rider = await Rider.findById(riderId).select('wallet fullName image');
  if (!rider) throw new AppError(404, "Rider not found");


  const orders = await Order.find({ rider: riderId, status: 'delivered' })
    .populate('user', 'fullName image')
    .sort({ completedAt: -1 }) 
    .select('user paymentInfo completedAt');


  const history = orders.map(order => {
    const totalCharge = order.paymentInfo.deliveryCharge || 0;
    const riderIncome = (totalCharge * 30) / 100; 
const customer = order.user as unknown as TUser;
    return {
      customerName: customer?.fullName || "Guest User",
      customerImage: customer?.image || null,
      date: order.completedAt,
      totalAmount: totalCharge,
      income: riderIncome, 
    };
  });



  return {
    totalBalance: rider.wallet,
    history
  };
};


export const RiderServices = {

  getMyProfileFromDB,
  deletePrifileFromDB,
  getAllUserFromDB,getSingleProfileFromDB,deleteUserFromDB,getNearbyRidersFromDB,getRiderOrderHistory,toggleAvailabilityInDB,getRiderWalletFromDB

};
