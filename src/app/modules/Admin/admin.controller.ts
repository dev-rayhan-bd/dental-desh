import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { AdminServices } from './admin.services';

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {

  const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
  
  const result = await AdminServices.getDashboardStatsFromDB(year);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dashboard statistics retrieved successfully",
    data: result,
  });
});
const approveRider = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AdminServices.approveRiderInDB(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Rider approved successfully! Now the rider can login.",
    data: result,
  });
});

export const AdminController = {
  getDashboardStats,approveRider
};