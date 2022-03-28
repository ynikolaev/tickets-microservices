import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';
import { Order } from '../../../models/order';
import { natsWrapper } from '../../../nats';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { ExpirationCompleteEvent, OrderStatus } from '@yn-projects/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();

  const order = Order.build({
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket: ticket.id,
  });
  await order.save();

  const eventData: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
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

  return { listener, order, ticket, eventData, message };
};

it('updates the order status to cancelled', async () => {
  const { listener, order, eventData, message } = await setup();

  await listener.onMessage(eventData, message);

  const updatedOrder = await Order.findById(order.id);
  if (!updatedOrder) throw new Error('Order not found');

  expect(updatedOrder.status).toBe(OrderStatus.Cancelled);
});

it('emit an OrderCancelled event', async () => {
  const { listener, order, ticket, eventData, message } = await setup();

  await listener.onMessage(eventData, message);
  expect(natsWrapper.client.publish).toBeCalledTimes(1);

  const parameters = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
  expect(parameters['id']).toBe(order.id);
  expect(parameters['ticket']['id']).toBe(ticket.id);
});

it('acks the message', async () => {
  const { listener, eventData, message } = await setup();

  await listener.onMessage(eventData, message);

  expect(message.ack).toBeCalledTimes(1);
});
