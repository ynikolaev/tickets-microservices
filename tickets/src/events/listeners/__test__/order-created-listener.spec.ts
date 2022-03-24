import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCreatedEvent, OrderStatus } from '@yn-projects/common';

import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats';
import { OrderCreatedListener } from '../order-created-listener';

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    title: 'Concert',
    price: 10,
    userId: '1321313',
  });
  await ticket.save();

  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    userId: ticket.userId,
    expiresAt: '123234',
    version: 0,
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
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

it('should find the ticket and lock it with current orderId', async () => {
  const { listener, data, ticket, message } = await setup();

  await listener.onMessage(data, message);

  const existingTicket = await Ticket.findById(ticket.id);
  if (!existingTicket) throw new Error('Ticket is not found');

  expect(existingTicket.orderId).toEqual(data.id);
});

it('should ack the message', async () => {
  const { listener, data, message } = await setup();

  await listener.onMessage(data, message);

  expect(message.ack).toBeCalledTimes(1);
});

it('publishes a ticket updated event', async () => {
  const { listener, data, ticket, message } = await setup();

  await listener.onMessage(data, message);

  expect(natsWrapper.client.publish).toBeCalledTimes(1);
  const parameters = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

  expect(parameters['id']).toEqual(ticket.id);
  expect(parameters['orderId']).toEqual(data.id);
});
