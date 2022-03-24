import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCancelledEvent, OrderCreatedEvent, OrderStatus } from '@yn-projects/common';

import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { OrderCreatedListener } from '../order-created-listener';

const setup = async () => {
  const orderCancelListener = new OrderCancelledListener(natsWrapper.client);
  const orderCreateListener = new OrderCreatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    title: 'Concert',
    price: 10,
    userId: '1321313',
  });
  await ticket.save();

  const orderCreatedData: OrderCreatedEvent['data'] = {
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

  const orderCancelledData: OrderCancelledEvent['data'] = {
    id: orderCreatedData.id,
    version: orderCreatedData.version,
    ticket: {
      id: ticket.id,
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

  return {
    orderCancelListener,
    orderCreateListener,
    cancelData: orderCancelledData,
    createdData: orderCreatedData,
    ticket,
    message,
  };
};

it('should unlock the ticket and remove orderId', async () => {
  const { orderCancelListener, orderCreateListener, cancelData, createdData, ticket, message } = await setup();
  await orderCreateListener.onMessage(createdData, message);

  const existingTicket = await Ticket.findById(ticket.id);
  if (!existingTicket) throw new Error('Ticket is not found');
  expect(existingTicket.orderId).toEqual(createdData.id);

  await orderCancelListener.onMessage(cancelData, message);
  const updatedTicket = await Ticket.findById(ticket.id);
  if (!updatedTicket) throw new Error('Ticket is not found');

  expect(updatedTicket.orderId).toBeUndefined();
});

it('should ack the message', async () => {
  const { orderCancelListener, orderCreateListener, cancelData, createdData, message } = await setup();

  await orderCreateListener.onMessage(createdData, message);
  await orderCancelListener.onMessage(cancelData, message);

  expect(message.ack).toBeCalledTimes(2);
});
