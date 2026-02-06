import { Server } from 'http';

import app from './app';

import mongoose from 'mongoose';
import config from './app/config';
import { Server as SocketServer } from 'socket.io';
import { socketHelper } from './app/utils/socketHelper';



let server: Server;

async function main() {
  try {
    await mongoose.connect(config.database_url as string);

    server = app.listen(config.port, () => {
      console.log(`app is listening on port ${config.port}`);
    });
    // socket configaration
 const io = new SocketServer(server, {
      cors: {
        origin: "*", 
        methods: ["GET", "POST"]
      },
       transports: ['websocket', 'polling']
    });


    socketHelper(io);
    app.set('io', io); 
  } catch (err) {
    console.log(err);
  }
}
main();

process.on('unhandledRejection', (err) => {
  console.log(`😈 unahandledRejection is detected , shutting down ...`, err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', () => {
  console.log(`😈 uncaughtException is detected , shutting down ...`);
  process.exit(1);
});
