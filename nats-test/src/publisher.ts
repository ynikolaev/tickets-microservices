import { randomBytes } from 'crypto';
import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './TicketCreatedPublisher';
console.clear();

// Client/STAN
const client = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
});

client.on('connect', async () => {
  console.log('Publisher connected to NATS');

  const data = {
    id: '123',
    title: 'concert',
    price: 20,
  };

  try {
    await new TicketCreatedPublisher(client).publish(data);
  } catch (error) {
    console.error('ERROR:', error);
  }
});
