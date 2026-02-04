import { Server as SocketServer } from 'socket.io'; 
import { RiderServices } from '../modules/rider/rider.services';
import { Rider } from '../modules/rider/rider.model';



export const socketHelper = (io: SocketServer) => {
  io.on('connection', (socket) => {

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

socket.on('update-live-location', async (data: { riderId: string, lat: number, lng: number }) => {
  // save Lat/Lng 
  await Rider.findByIdAndUpdate(data.riderId, {
    lastLocation: {
      type: 'Point',
      coordinates: [data.lng, data.lat] 
    }
  });

  // broadcast new location
  io.emit('rider-moved', {
    riderId: data.riderId,
    lat: data.lat,
    lng: data.lng
  });
});



  });
};