import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { natsWrapper } from './nats';

const start = async () => {
  if (!process.env.NATS_CLUSTERID) {
    throw new Error('NATS_CLUSTERID env variable is not defined');
  }
  if (!process.env.NATS_CLIENTID) {
    throw new Error('NATS_CLIENTID env variable is not defined');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL env variable is not defined');
  }
  if (!process.env.REDIS_HOST) {
    throw new Error('REDIS_HOST env variable is not defined');
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

    new OrderCreatedListener(natsWrapper.client).listen();
  } catch (error) {
    console.log(error);
  }
};

start();
