import { OrderStatus } from '@yn-projects/common';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';

it('has a route handler listening to /api/orders for get request', async () => {
  const response = await request(app).get('/api/orders/testtest').send({});
  expect(response.statusCode).not.toEqual(404);
});

it('returns 401 if the user is not signed in', async () => {
  await request(app).get('/api/orders/testtest').send({}).expect(401);
});

it('returns 400 if order id is invalid', async () => {
  await request(app).get('/api/orders/31323334353637383930313').set('Cookie', signin()).send({}).expect(400);
});

it('returns 404 if order was not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).get(`/api/orders/${id}`).set('Cookie', signin()).send({}).expect(404);
});

it('returns 401 if order returned was not created by this user', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: 'Ticket1',
    price: 20,
  });
  await ticket.save();
  const order = Order.build({
    ticket,
    userId,
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();
  await request(app).get(`/api/orders/${order.id}`).set('Cookie', signin()).send({}).expect(401);
});

it('returns 200 and order if request is valid', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: 'Ticket1',
    price: 20,
  });
  await ticket.save();
  const order = Order.build({
    ticket,
    userId,
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  const { body } = await request(app).get(`/api/orders/${order.id}`).set('Cookie', signin(userId)).send({}).expect(200);
  expect(body.id).toEqual(order.id);
  expect(body.ticket.id).toEqual(ticket.id);
});
