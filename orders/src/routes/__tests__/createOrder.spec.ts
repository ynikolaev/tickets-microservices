import { OrderStatus } from '@yn-projects/common';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats';

it('has a route handler listening to /api/orders for post request', async () => {
  const response = await request(app).post('/api/orders').send({});

  expect(response.statusCode).not.toEqual(404);
});

it('returns 401 if the user is not signed in', async () => {
  await request(app).post('/api/orders').send({}).expect(401);
});

it('returns not 401 if user is authenticated', async () => {
  const response = await request(app).post('/api/orders').set('Cookie', signin()).send({});

  expect(response.statusCode).not.toEqual(401);
});

it('returns 400 if an invalid ticket ID is provided', async () => {
  await request(app)
    .post('/api/orders')
    .set('Cookie', signin())
    .send({
      ticketId: '31323334353637383930313',
    })
    .expect(400);
  await request(app)
    .post('/api/orders')
    .set('Cookie', signin())
    .send({
      ticketId: '',
    })
    .expect(400);
  await request(app).post('/api/orders').set('Cookie', signin()).send({}).expect(400);
});

it('returns 404 if the ticket does not exist', async () => {
  const ticketId = mongoose.Types.ObjectId.generate().toString('hex');
  await request(app)
    .post('/api/orders')
    .set('Cookie', signin())
    .send({
      ticketId,
    })
    .expect(404);
});

it('returns 400 if the ticket is already reserved', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Ticket1',
    price: 20,
  });

  const { id: ticketId } = await ticket.save();
  const order = Order.build({
    ticket,
    userId: '1234',
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', signin())
    .send({
      ticketId,
    })
    .expect(400);
});

it('returns 201 and saves the order', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Ticket1',
    price: 20,
  });
  const { id: ticketId } = await ticket.save();
  const {
    body: { id: orderId },
  } = await request(app)
    .post('/api/orders')
    .set('Cookie', signin())
    .send({
      ticketId,
    })
    .expect(201);

  const existingOrder = await Order.findOne({
    ticket,
  });

  expect(existingOrder).toBeTruthy();
  expect(orderId).toEqual(existingOrder!.id);
});

it('emits an order:created event', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Ticket1',
    price: 20,
  });
  const { id: ticketId } = await ticket.save();
  await request(app)
    .post('/api/orders')
    .set('Cookie', signin())
    .send({
      ticketId,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toBeCalledTimes(1);
});
