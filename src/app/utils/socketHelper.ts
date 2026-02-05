import { Server as SocketServer } from 'socket.io';
import { RiderServices } from '../modules/rider/rider.services';
import { Rider } from '../modules/rider/rider.model';
import { verifyToken } from '../modules/Auth/auth.utils';
import config from '../config';

export const socketHelper = (io: SocketServer) => {
  io.on('connection', (socket) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.token;

    try {
      if (token) {
        const decoded = verifyToken(token as string, config.jwt_access_secret as string);
        socket.data.user = decoded;
      }
    } catch (err) {
      console.log("❌ Socket Auth Error");
    }

    // ১. রুমে জয়েন করা (resilient logic)
    socket.on('join-order-room', (data: any) => {
      // যদি ডাটা স্ট্রিং হয় তবে সরাসরি নিবে, আর অবজেক্ট হলে ভেতর থেকে আইডি নিবে
      const orderId = typeof data === 'string' ? data : data?.orderId;
      if (orderId) {
        socket.join(orderId);
        console.log(`🏠 Joined room: ${orderId}`);
      }
    });

    // ২. লাইভ লোকেশন আপডেট (Rider to User)
    socket.on('update-live-location', (data: any) => {
      if (!data || !data.orderId || !data.lat) return;

      console.log(`📍 Rider ${socket.data.user?.userId} moving in room: ${data.orderId}`);
      socket.to(data.orderId).emit('rider-location-updated', {
        lat: data.lat,
        lng: data.lng,
        riderId: socket.data.user?.userId
      });
    });

    // ৩. গ্লোবাল লোকেশন আপডেট (DB Update)
    socket.on('rider-location-update', async (data: any) => {
      const rId = data?.riderId || socket.data.user?.userId;
      if (!rId || !data.lat) return;

      try {
        await Rider.findByIdAndUpdate(rId, {
          lastLocation: { type: 'Point', coordinates: [data.lng, data.lat] }
        });
        io.emit('rider-moved-globally', { riderId: rId, lat: data.lat, lng: data.lng });
      } catch (error) {
        console.error("❌ DB Update Error");
      }
    });

    socket.on('get-nearby-riders', async (data: any) => {
      if (!data || !data.lat) return;
      const riders = await RiderServices.getNearbyRidersFromDB(data.lat, data.lng);
      socket.emit('nearby-riders-list', riders);
    });
  });
};