import { Server as SocketServer } from 'socket.io'; 
import { RiderServices } from '../modules/rider/rider.services';
import { Rider } from '../modules/rider/rider.model';
import { verifyToken } from '../modules/Auth/auth.utils';
import config from '../config';



export const socketHelper = (io: SocketServer) => {
  io.on('connection', (socket) => {


socket.on('join-order-room', (orderId: string) => {
  socket.join(orderId);
  console.log(` Joined room: ${orderId}`);
});
    
       const token = socket.handshake.auth?.token || socket.handshake.headers?.token;
    
    console.log("Token received:", token); 
    
    try {
      if (token) {
        const decoded = verifyToken(token, config.jwt_access_secret as string);
        
        socket.data.user = decoded; 
        console.log(` User Connected: ${decoded.userId} (Role: ${decoded.role})`);
      }
    } catch (err) {
      console.log(" Socket Auth Error:", "Invalid Token");
    }

   socket.on('update-live-location', (data) => {
       console.log(` Rider ${socket.data.user?.userId} moving to:`, data.lat, data.lng);
       

       socket.to(data.orderId).emit('rider-location-updated', {
         lat: data.lat,
         lng: data.lng,
         riderId: socket.data.user?.userId
       });
    });


    // when user open the map
    socket.on('get-nearby-riders', async (data: { lat: number, lng: number }) => {
      const riders = await RiderServices.getNearbyRidersFromDB(data.lat, data.lng);
      
    
      socket.emit('nearby-riders-list', riders);
    });

    //when rider location is update
    socket.on('rider-location-update', async (data: { riderId: string, lat: number, lng: number }) => {
    // save loc on db
      await Rider.findByIdAndUpdate(data.riderId, {
        lastLocation: { type: 'Point', coordinates: [data.lng, data.lat] }
      });

//   broadcast to nearby users
      io.emit('rider-moved-globally', {
        riderId: data.riderId,
        lat: data.lat,
        lng: data.lng
      });
    });





  });
};