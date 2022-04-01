import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCreatedEvent, OrderStatus } from '@yn-projects/common';

import { Order } from '../../../models/order';
import { natsWrapper } from '../../../nats';
import { OrderCreatedListener } from '../order-created-listener';

const setup = () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    userId: 'test',
    expiresAt: 'test',
    version: 0,
    ticket: {
      id: 'test',
      price: 10,
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

  return { listener, data, message };
};

it('replicates the order info', async () => {
  const { listener, data, message } = setup();

  await listener.onMessage(data, message);

  const order = await Order.findById(data.id);
  if (!order) throw new Error("Order wasn't found");

  expect(order.price).toEqual(data.ticket.price);
});

it('acks the message', async () => {
  const { listener, data, message } = setup();

  await listener.onMessage(data, message);

  expect(message.ack).toBeCalledTimes(1);
});
