import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from 'http-status';
import { RiderServices } from "./rider.services";

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const meId = req?.user?.userId;
//   console.log("me id----------->",meId);
  const result = await RiderServices.getMyProfileFromDB(meId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile retrive successfully!",
    data: result,
  });
});


const getSingleProfile = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await RiderServices.getMyProfileFromDB(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile retrive successfully!",
    data: result,
  });
});
const getAllUser = catchAsync(async (req: Request, res: Response) => {
  const result = await RiderServices.getAllUserFromDB(req?.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Riders retrive successfully!",
    data: result,
  });
});

const deleteProfile = catchAsync(async (req: Request, res: Response) => {
  const meId = req?.user?.userId;

  const result = await RiderServices.deletePrifileFromDB(meId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile deleted successfully!",
    data: result,
  });
});

export const RiderController={getMyProfile,getSingleProfile,getAllUser,deleteProfile}