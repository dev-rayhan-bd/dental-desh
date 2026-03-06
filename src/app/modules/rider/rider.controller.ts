import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from 'http-status';
import { RiderServices } from "./rider.services";
import uploadImage from "../../middleware/upload";
import AppError from "../../errors/AppError";

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



const toggleStatus = catchAsync(async (req: Request, res: Response) => {
  const riderId = req.user.userId; 
  const result = await RiderServices.toggleAvailabilityInDB(riderId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Rider is now ${result?.isAvailable ? 'Online' : 'Offline'}`,
    data: result,
  });

});



const getOrderHistory = catchAsync(async (req: Request, res: Response) => {
  const riderId = req.user.userId;
  const result = await RiderServices.getRiderOrderHistory(riderId,req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Rider delivery history retrieved successfully",
    data: result,
  });
});

const getMyWallet = catchAsync(async (req: Request, res: Response) => {
  const result = await RiderServices.getRiderWalletFromDB(req.user.userId,req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Wallet details retrieved successfully",
    data: result,
  });
});


const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const riderId = req.user.userId;
  const payload = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };


  if (payload.vehicleNumber && (!files || !files.vehicleImage)) {
    throw new AppError(
      httpStatus.BAD_REQUEST, 
      "Security Alert: You must upload a new vehicle image whenever you change your vehicle number."
    );
  }


  if (files?.image) {
    payload.image = await uploadImage(req, files.image[0]);
  }
  
  if (files?.drivingLicense) {
    payload.drivingLicense = await uploadImage(req, files.drivingLicense[0]);
  }

  if (files?.vehicleImage) {
    payload.vehicleImage = await uploadImage(req, files.vehicleImage[0]);
  }


  const result = await RiderServices.updateRiderProfileFromDB(riderId, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});


export const RiderController={getMyProfile,getSingleProfile,getAllUser,deleteProfile,toggleStatus,getOrderHistory,getMyWallet,updateProfile}