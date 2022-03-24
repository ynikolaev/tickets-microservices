import mongoose from 'mongoose';
import request from 'supertest';
import { OrderStatus } from '@yn-projects/common';

import { app } from '../../app';
import { IOrderDocument, Order } from '../../models/order';
import { ITicketDocument, Ticket } from '../../models/ticket';

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Ticket1',
    price: 20,
  });
  await ticket.save();
  return ticket;
};
const buildOrder = async (ticket: ITicketDocument) => {
  const order = Order.build({
    ticket,
    userId: '1234',
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();
  return order;
};

it('has a route handler listening to /api/orders for get request', async () => {
  const response = await request(app).get('/api/orders').send({});
  expect(response.statusCode).not.toEqual(404);
});

it('returns 401 if the user is not signed in', async () => {
  await request(app).get('/api/orders').send({}).expect(401);
});

it('returns 200 if orders exist', async () => {
  const ticketOne = await buildTicket();
  await buildOrder(ticketOne);

  await request(app).get('/api/orders').set('Cookie', signin()).send({}).expect(200);
});

it('fetches orders for a particular user', async () => {
  const ticketOne = await buildTicket();
  const ticketTwo = await buildTicket();
  const ticketThree = await buildTicket();

  const userOne = signin();
  const userTwo = signin();

  // Create one Order from User 1
  const {
    body: { id: OrderOneId },
  } = await request(app).post('/api/orders').set('Cookie', userOne).send({ ticketId: ticketOne.id }).expect(201);

  // Create two Orders from User 2
  const {
    body: { id: OrderTwoId },
  } = await request(app).post('/api/orders').set('Cookie', userTwo).send({ ticketId: ticketTwo.id }).expect(201);
  const {
    body: { id: OrderThreeId },
  } = await request(app).post('/api/orders').set('Cookie', userTwo).send({ ticketId: ticketThree.id }).expect(201);

  // User 1 can access only 1 order
  const { body: userOneRes } = await request(app).get('/api/orders').set('Cookie', userOne).send({}).expect(200);
  expect(userOneRes.length).toEqual(1);
  expect(userOneRes[0].id).toEqual(OrderOneId);

  // User 1 can access only 2 orders
  const { body: userTwoRes } = await request(app).get('/api/orders').set('Cookie', userTwo).send({}).expect(200);
  expect(userTwoRes.length).toEqual(2);
  expect(userTwoRes.some((obj: IOrderDocument) => obj.id === OrderTwoId)).toEqual(true);
  expect(userTwoRes.some((obj: IOrderDocument) => obj.id === OrderThreeId)).toEqual(true);
});
