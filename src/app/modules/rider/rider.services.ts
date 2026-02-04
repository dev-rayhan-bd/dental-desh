/* eslint-disable @typescript-eslint/no-explicit-any */

import AppError from "../../errors/AppError";

import httpStatus from 'http-status';

import QueryBuilder from "../../builder/QueryBuilder";
import { Rider } from "./rider.model";
import { Order } from "../Order/order.model";




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
  }).select('fullName image lastLocation rating');

  return riders;
};

const getRiderOrderHistory = async (riderId: string) => {

  const result = await Order.find({ rider: riderId, status: 'delivered' })
    .sort({ createdAt: -1 });

  return result;
};


export const RiderServices = {

  getMyProfileFromDB,
  deletePrifileFromDB,
  getAllUserFromDB,getSingleProfileFromDB,deleteUserFromDB,getNearbyRidersFromDB,getRiderOrderHistory

};
