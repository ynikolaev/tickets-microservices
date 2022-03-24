import mongoose from 'mongoose';
import { TicketUpdatedEvent } from '@yn-projects/common';
import { Message } from 'node-nats-streaming';

import { natsWrapper } from '../../../nats';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  const listener = new TicketUpdatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 10,
  });
  await ticket.save();

  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    title: 'new concert',
    price: 15,
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: ticket.version + 1,
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

  return { listener, data, ticket, message };
};

it('finds, updates and saves a ticket', async () => {
  const { listener, data, ticket, message } = await setup();

  await listener.onMessage(data, message);

  const existingTicket = await Ticket.findById(ticket.id);
  if (!existingTicket) throw new Error("Ticket wasn't found");

  expect(existingTicket.version).toEqual(data.version);
  expect(existingTicket.title).toEqual(data.title);
  expect(existingTicket.price).toEqual(data.price);
});

it('not calling ack if updates come in wrong order (version is bigger than in db record)', async () => {
  const { listener, data, message } = await setup();
  data.version = 10;

  try {
    await listener.onMessage(data, message);
  } catch {}

  expect(message.ack).toBeCalledTimes(0);
});

it('acks the message', async () => {
  const { listener, data, message } = await setup();

  await listener.onMessage(data, message);

  expect(message.ack).toBeCalledTimes(1);
});
