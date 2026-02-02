/* eslint-disable @typescript-eslint/no-explicit-any */

import AppError from "../../errors/AppError";

import httpStatus from 'http-status';

import QueryBuilder from "../../builder/QueryBuilder";
import { Rider } from "./rider.model";




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




export const RiderServices = {

  getMyProfileFromDB,
  deletePrifileFromDB,
  getAllUserFromDB,getSingleProfileFromDB,deleteUserFromDB

};
