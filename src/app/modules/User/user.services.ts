/* eslint-disable @typescript-eslint/no-explicit-any */

import AppError from "../../errors/AppError";
import { TEditProfile } from "./user.constant";
import httpStatus from 'http-status';
import { UserModel } from "./user.model";
import QueryBuilder from "../../builder/QueryBuilder";
import { Rider } from "../rider/rider.model";
import { Order } from "../Order/order.model";
import { DeliveryQuote } from "../deliveryQuote/deliveryQuote.model";



const updateProfileFromDB = async (id: string, payload: TEditProfile) => {

  const result = await UserModel.findByIdAndUpdate(id, payload, {
    new: true,
  });

  return result;
};
const getMyProfileFromDB = async (id: string, ) => {
  const result = await UserModel.findById(id);

  return result;
};
const getSingleProfileFromDB = async (id: string, ) => {
  const result = await UserModel.findById(id);

  return result;
};


const deletePrifileFromDB = async (id: string) => {

  const user = await UserModel.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User profile not found!');
  }


  if (user.role === 'driver') {
    const rider = await Rider.findById(id);

    if (rider && rider.wallet > 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST, 
        `You cannot delete your profile while you have a balance of $${rider.wallet}. Please withdraw your funds first.`
      );
    }

    const ongoingTrip = await Order.findOne({ 
      rider: id, 
      status: { $ne: 'delivered' } 
    });

    if (ongoingTrip) {
      throw new AppError(
        httpStatus.BAD_REQUEST, 
        'Active trip in progress! You must complete your current delivery before deleting your profile.'
      );
    }

    await Rider.findByIdAndDelete(id);
  }


  if (user.role === 'user') {

    const hasPendingQuote = await DeliveryQuote.findOne({ user: id });

    const hasActiveOrder = await Order.findOne({ 
      user: id, 
      status: { $ne: 'delivered' } 
    });

    if (hasPendingQuote || hasActiveOrder) {
      throw new AppError(
        httpStatus.BAD_REQUEST, 
        'You have active delivery requests or ongoing orders. Please wait for completion or cancel them first.'
      );
    }
  }


  const result = await UserModel.findByIdAndDelete(id);

  return result;
};

const deleteUserFromDB = async (id: string) => {

  const user = await UserModel.findById(id);
  
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }


  if (user.role === 'driver') {
    const riderProfile = await Rider.findById(id);


    if (riderProfile && riderProfile.wallet > 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST, 
        `Cannot delete. Rider has a remaining balance of $${riderProfile.wallet} in wallet.`
      );
    }


    const activeOrder = await Order.findOne({ 
      rider: id, 
      status: { $ne: 'delivered' } 
    });
    
    if (activeOrder) {
      throw new AppError(
        httpStatus.BAD_REQUEST, 
        'Cannot delete. Rider currently has an active delivery in progress.'
      );
    }


    await Rider.findByIdAndDelete(id);
  }

 
  if (user.role === 'user') {

    const pendingQuote = await DeliveryQuote.findOne({ user: id });
    
 
    const activeOrder = await Order.findOne({ 
      user: id, 
      status: { $ne: 'delivered' } 
    });

    if (pendingQuote || activeOrder) {
      throw new AppError(
        httpStatus.BAD_REQUEST, 
        'Cannot delete. User has pending delivery requests or ongoing orders.'
      );
    }
  }


  const deletedUser = await UserModel.findByIdAndDelete(id);

  return deletedUser;
};
const getAllUserFromDB = async (query: Record<string, unknown>) => {
  const queryBuilder = new QueryBuilder(UserModel.find(), query);
  queryBuilder.search(["fullName", "email", "role"]).filter().sort().paginate();
  const result = await queryBuilder.modelQuery;
  const meta = await queryBuilder.countTotal();

  return { meta, result };
};
const blockUserFromDB = async (id: string, status: string) => {
  
  const user = await UserModel.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }


  if (user.role === 'driver') {
    await Rider.findByIdAndUpdate(
      id,
      { status }, 
      { new: true, runValidators: true }
    );
  }

  return user;
};



export const UserServices = {
  updateProfileFromDB,
  getMyProfileFromDB,
  deletePrifileFromDB,
  getAllUserFromDB,getSingleProfileFromDB,deleteUserFromDB,blockUserFromDB

};
