import { Server as SocketServer } from "socket.io";
import { RiderServices } from "../modules/rider/rider.services";
import { Rider } from "../modules/rider/rider.model";
import { verifyToken } from "../modules/Auth/auth.utils";
import config from "../config";
import { Message } from "../modules/Message/message.model";
import { sendNotification } from "./sendNotification";

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





    socket.on("join-order-room", (data: any) => {
      const roomId =
        typeof data === "string" ? data : data?.trackingId || data?.orderId;

      if (roomId) {
        socket.join(roomId);
        console.log(`🏠 Joined room: ${roomId}`);
      }
    });

    // live loc update for order track
    socket.on("update-live-location", (data: any) => {
      if (!data || !data.orderId || !data.lat) return;

      console.log(
        `📍 Rider ${socket.data.user?.userId} moving in room: ${data.orderId}`,
      );
      socket.to(data.orderId).emit("rider-location-updated", {
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


  io.to(data.trackingId).emit('new-message', newMessage);
  
  console.log(`📩 Message saved & sent to room: ${data.trackingId}`);

  await sendNotification(
    data.receiverId,
    "New Message 💬",
    data.text || "You received a photo.",
    "general"
  );

  
});


  });
};
