import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCancelledEvent, OrderStatus } from '@yn-projects/common';

import { Order } from '../../../models/order';
import { natsWrapper } from '../../../nats';
import { OrderCancelledListener } from '../order-cancelled-listener';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: 'test',
    price: 10,
    status: OrderStatus.Created,
  });
  await order.save();

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: order.version + 1,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
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

it('changes order status to be cancelled', async () => {
  const { listener, data, message } = await setup();

  await listener.onMessage(data, message);

  const order = await Order.findById(data.id);
  if (!order) throw new Error("Order wasn't found");

  expect(order.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
  const { listener, data, message } = await setup();

  await listener.onMessage(data, message);

  expect(message.ack).toBeCalledTimes(1);
});
