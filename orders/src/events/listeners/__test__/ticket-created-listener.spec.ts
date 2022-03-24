import mongoose from 'mongoose';

import { TicketCreatedEvent } from '@yn-projects/common';
import { natsWrapper } from '../../../nats';
import { TicketCreatedListener } from '../ticket-created-listener';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';

const setup = () => {
  const listener = new TicketCreatedListener(natsWrapper.client);

  const data: TicketCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
  };

  const message: Message = {
    getSubject: jest.fn(),
    getSequence: jest.fn(),
    getRawData: jest.fn(),
    getData: jest.fn(),
    getTimestampRaw: jest.fn(),
    getTimestamp: jest.fn(),
    isRedelivered: jest.fn(),
    getCrc32: jest.fn(),
    ack: jest.fn(),
  };

  return { listener, data, message };
};

it('creates and saves a ticket', async () => {
  const { listener, data, message } = setup();

  await listener.onMessage(data, message);

  const ticket = await Ticket.findById(data.id);
  if (!ticket) throw new Error("Ticket wasn't created");

  expect(ticket.title).toEqual(data.title);
  expect(ticket.price).toEqual(data.price);
  expect(ticket.version).toEqual(0);
});

it('acks the message', async () => {
  const { listener, data, message } = setup();

  await listener.onMessage(data, message);

  expect(message.ack).toBeCalledTimes(1);
});
