import { Server as SocketServer } from "socket.io";
import { RiderServices } from "../modules/rider/rider.services";
import { Rider } from "../modules/rider/rider.model";
import { verifyToken } from "../modules/Auth/auth.utils";
import config from "../config";
import { Message } from "../modules/Message/message.model";
import { sendNotification } from "./sendNotification";
import { DeliveryQuoteService } from "../modules/deliveryQuote/deliveryQuote.services";
import { Order } from "../modules/Order/order.model";

export const socketHelper = (io: SocketServer) => {

 
  io.use((socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.token ||  socket.handshake.query?.token as string;

    if (!token) {

      return next(new Error("Authentication error: Token missing"));
    }

    try {
      const decoded = verifyToken(token, config.jwt_access_secret as string);

      socket.data.user = decoded;
      next(); 
    } catch (err) {

      console.log("❌ Socket connection rejected: Invalid or Expired Token");
      return next(new Error("Authentication error: Invalid or Expired Token"));
    }
  });



  io.on("connection", (socket) => {
    // const token =
    //   socket.handshake.auth?.token || socket.handshake.headers?.token ||  socket.handshake.query?.token as string;

    // try {
    //   if (token) {
    //     const decoded = verifyToken(
    //       token as string,
    //       config.jwt_access_secret as string,
    //     );
    //     socket.data.user = decoded;
    //   }
    // } catch (err) {
    //   console.log("❌ Socket Auth Error");
    // }

  const user = socket.data.user;
  const checkAndJoinPool = async () => {
  if (user?.role === 'driver') {
    const rider = await Rider.findById(user.userId);

    if (rider?.isOnline && rider?.isAvailable) {
      socket.join("available-riders");
      console.log(`🟢 Rider ${user.userId} is now waiting for jobs`);

 
      socket.emit('available-pool-joined', {
        success: true,
        message: "You are now in the available riders pool. Waiting for new jobs...",
        room: "available-riders"
      });
    }
  }
};
    checkAndJoinPool();


    socket.on("join-order-room", (data: any) => {
      const roomId =
        typeof data === "string" ? data : data?.trackingId || data?.orderId;

      if (roomId) {
        socket.join(roomId);
        console.log(`🏠 Joined room: ${roomId}`);
      }
    });
socket.on("join-order-room", (data: any) => {
  const roomId = typeof data === "string" ? data : data?.trackingId || data?.orderId;

  if (roomId) {
    socket.join(roomId);
    console.log(`🏠 Joined room: ${roomId}`);

   
    socket.emit("joined-success", {
      success: true,
      message: `Successfully joined tracking room: ${roomId}`,
      roomId: roomId
    });
  } else {
    socket.emit("error-message", { message: "Invalid trackingId or orderId" });
  }
});
    // live loc update for order track
   socket.on("update-live-location", (data: any) => {

  const roomId = data?.trackingId || data?.orderId;
  
  if (!roomId || !data.lat) return;


  console.log(` Rider ${socket.data.user?.userId} moving in room: ${roomId}`);


  socket.to(roomId).emit("rider-location-updated", {
    lat: data.lat,
    lng: data.lng,
    riderId: socket.data.user?.userId,
  });
});

    // rider loc update on db
    socket.on("rider-location-update", async (data: any) => {
      const rId = data?.riderId || socket.data.user?.userId;
      if (!rId || !data.lat) return;

      try {
        await Rider.findByIdAndUpdate(rId, {
          lastLocation: { type: "Point", coordinates: [data.lng, data.lat] },
        });
        io.emit("rider-moved-globally", {
          riderId: rId,
          lat: data.lat,
          lng: data.lng,
        });
      } catch (error) {
        console.error("❌ DB Update Error");
      }
    });

    socket.on("get-nearby-riders", async (data: any) => {
      if (!data || !data.lat) return;
      const riders = await RiderServices.getNearbyRidersFromDB(
        data.lat,
        data.lng,
      );
      socket.emit("nearby-riders-list", riders);
    });

socket.on('send-message', async (data: { 
  trackingId: string, 
  receiverId: string, 
  text?: string, 
  image?: string 
}) => {
  const senderId = socket.data.user?.userId;

  if (!senderId || !data.trackingId) return;


  const newMessage = await Message.create({
    trackingId: data.trackingId,
    sender: senderId,
    receiver: data.receiverId,
    text: data.text,
    image: data.image
  });


    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'fullName email contact image')
      .populate('receiver', 'fullName email contact image')
      .lean();

  
    io.to(data.trackingId).emit('new-message', populatedMessage);
  // io.to(data.trackingId).emit('new-message', newMessage);
  
  console.log(`📩 Message saved & sent to room: ${data.trackingId}`);

  await sendNotification(
    data.receiverId,
    "New Message 💬",
    data.text || "You received a photo.",
    "general"
  );

  
});











// socket.on('accept-delivery-job', async (data: { quoteId: string }) => {
//   try {
//     const riderId = socket.data.user?.userId;
//     if (!riderId) return socket.emit('error-message', 'Rider not authenticated');


//     const result = await DeliveryQuoteService.acceptJobInDB(data.quoteId, riderId);


//     socket.join(result.trackingId);


//     const fullOrderData = await Order.findById(result._id)

//       .populate('user')
//       .populate('rider')
//       .lean();

 
//     socket.emit('job-accept-success', {
//       success: true,
//       message: 'You have successfully accepted the job!',
//       trackingId: result.trackingId, 
//       roomStatus: "Left 'available-riders' and joined tracking room",
//       data: fullOrderData 
//     });

   
//     io.to(result.trackingId).emit('order-status-updated', {
//       status: 'req accepted',
//       rider: result.rider,
//       trackingId: result.trackingId
//     });

 
//     io.emit('job-taken', { quoteId: data.quoteId });
//   socket.leave("available-riders");
//   socket.join(result.trackingId);
//     console.log(`✅ Job Accepted: ${result.trackingId} by Rider: ${riderId}`);

//   } catch (error: any) {
//     console.error("❌ Job Accept Error:", error.message);
//     socket.emit('error-message', error.message || 'Failed to accept job');
//   }
// });

socket.on('accept-delivery-job', async (data: { quoteId: string }) => {
  try {
    const riderId = socket.data.user?.userId;
    if (!riderId) return socket.emit('error-message', 'Rider not authenticated');

  
    const result = await DeliveryQuoteService.acceptJobInDB(data.quoteId, riderId);

    
    socket.leave("available-riders"); 
    socket.join(result.trackingId);  

   
    const fullOrderData = await Order.findById(result._id)
      .populate('user')
      .populate('rider')
      .lean();

    //send rider confirmation (Private)
    socket.emit('job-accept-success', {
      success: true,
      message: 'You have claimed the job!',
      trackingId: result.trackingId, 
      data: fullOrderData 
    });

    // for user (Broadcast)

    io.to(result.trackingId).emit('order-status-updated', {
        success: true,
      message: 'Rider Found!  Your delivery is on the way.',
      trackingId: result.trackingId, 
      data: fullOrderData
    });


    io.emit('job-taken', { quoteId: data.quoteId });

    console.log(`✅ Job ${result.trackingId} synced successfully.`);

  } catch (error: any) {
    console.error("❌ Job Accept Error:", error.message);
    socket.emit('error-message', error.message || 'Failed to accept job');
  }
});


socket.on('set-as-available', async () => {
  try {
    const user = socket.data.user;
    if (user?.role !== 'driver') return;

 
    const activeOrder = await Order.findOne({
      rider: user.userId,
      status: { $ne: 'delivered' } 
    });

    if (activeOrder) {
     
      return socket.emit('availability-error', {
        success: false,
        message: "Action denied! You cannot become available until your current delivery is finished."
      });
    }

 
    await Rider.findByIdAndUpdate(user.userId, { 
      isAvailable: true 
    });

   
    socket.join("available-riders");

  
    socket.emit('availability-success', {
      success: true,
      isAvailable: true,
      message: "You are now online and ready for new jobs."
    });

    console.log(`🔓 Rider ${user.userId} is now verified as free and added to pool.`);

  } catch (error) {
    console.error("❌ Availability Update Error:", error);
    socket.emit('error-message', "Internal server error during availability update");
  }
});




















  });
};
