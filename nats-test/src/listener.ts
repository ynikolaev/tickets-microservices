import { randomBytes } from 'crypto';
import nats from 'node-nats-streaming';
import { TicketCreatedListener } from './TicketCreatedListener';
console.clear();

// Client/STAN
const client = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
});

client.on('connect', () => {
  console.log('Listener connected to NATS');

  new TicketCreatedListener(client).listen();

  client.on('close', () => {
    console.log('NATS connection closed');
    process.exit();
  });
});

process.on('SIGINT', () => client.close()); //interrupt
process.on('SIGTERM', () => client.close()); //terminate
