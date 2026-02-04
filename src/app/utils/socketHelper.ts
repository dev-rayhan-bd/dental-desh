import { Server as SocketServer } from 'socket.io'; // এই নামে ইমপোর্ট করুন
import { RiderServices } from '../modules/rider/rider.services';
import { Rider } from '../modules/rider/rider.model';



export const socketHelper = (io: SocketServer) => {
  io.on('connection', (socket) => {

    // ১. ইউজার যখন ম্যাপ ওপেন করবে
    socket.on('get-nearby-riders', async (data: { lat: number, lng: number }) => {
      const riders = await RiderServices.getNearbyRidersFromDB(data.lat, data.lng);
      
      // শুধুমাত্র ওই ইউজারকে রাইডারদের লিস্ট পাঠিয়ে দাও
      socket.emit('nearby-riders-list', riders);
    });

    // ২. রাইডার যখন তার লোকেশন আপডেট করবে
    socket.on('rider-location-update', async (data: { riderId: string, lat: number, lng: number }) => {
      // ডাটাবেসে লোকেশন সেভ করুন
      await Rider.findByIdAndUpdate(data.riderId, {
        lastLocation: { type: 'Point', coordinates: [data.lng, data.lat] }
      });

      // আশেপাশে থাকা ইউজারদের ব্রডকাস্ট করুন (Optional: আপনি চাইলে অর্ডার রুম ব্যবহার করতে পারেন)
      io.emit('rider-moved-globally', {
        riderId: data.riderId,
        lat: data.lat,
        lng: data.lng
      });
    });
  });
};