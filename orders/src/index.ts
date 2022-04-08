import mongoose from 'mongoose';

import { app } from './app';
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener';
import { PaymentCreatedListener } from './events/listeners/payment-created-listener';
import { TicketCreatedListener } from './events/listeners/ticket-created-listener';
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener';
import { natsWrapper } from './nats';

const start = async () => {
  console.log('Starting the service...');

  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY env variable is not defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI env variable is not defined');
  }
  if (!process.env.NATS_CLUSTERID) {
    throw new Error('NATS_CLUSTERID env variable is not defined');
  }
  if (!process.env.NATS_CLIENTID) {
    throw new Error('NATS_CLIENTID env variable is not defined');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL env variable is not defined');
  }
  try {
    await natsWrapper.connect(process.env.NATS_CLUSTERID, process.env.NATS_CLIENTID, process.env.NATS_URL).catch(() => {
      console.log('NATS is not ready...');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close()); //interrupt
    process.on('SIGTERM', () => natsWrapper.client.close()); //terminate
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed');
      process.exit();
    });

    // Listeners
    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();

    // DB connection
    await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    console.log(error);
  }

  console.log('Connected to MongoDB');

  app.listen(3000, () => {
    console.log('Listening on port 3000');
  });
};

start();
