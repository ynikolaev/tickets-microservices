import mongoose from 'mongoose';

import { app } from './app';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';
import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { natsWrapper } from './nats';

const start = async () => {
  console.log('Starting service...');

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
    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();

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
