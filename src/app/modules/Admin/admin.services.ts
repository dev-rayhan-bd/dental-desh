import { Order } from "../Order/order.model";
import { Rider } from "../rider/rider.model";
import { UserModel } from "../User/user.model";

const getDashboardStatsFromDB = async (year: number) => {

  const totalUser = await UserModel.countDocuments({ role: 'user' });
  const totalDriver = await Rider.countDocuments();
  const totalDelivery = await Order.countDocuments();


  const monthlyStats = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" }, 
        count: { $sum: 1 },      
      },
    },
    { $sort: { "_id": 1 } },        
  ]);


  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
  
  const chartData = monthNames.map((month, index) => {
    const targetMonth = index + 1;
    const found = monthlyStats.find((item) => item._id === targetMonth);
    return {
      month: month,
      orderCount: found ? found.count : 0, 
    };
  });

  return {
    totalUser,
    totalDriver,
    totalDelivery,
    chartData,
  };
};

export const AdminServices = {
  getDashboardStatsFromDB,
};