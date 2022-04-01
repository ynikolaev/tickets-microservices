import { OrderStatus } from '@yn-projects/common';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Payments } from '../../models/payments';
import { stripe } from '../../stripe';
import { stripeIdRes } from '../../__mocks__/stripe';

it('returns 404 when purchasing non-existing order', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', signin())
    .send({
      token: 'test',
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('returns 401 when purchasing an order that does not belong to the user', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signin(new mongoose.Types.ObjectId().toHexString()))
    .send({
      token: 'test',
      orderId: order.id,
    })
    .expect(401);
});

it('returns 400 when purchasing a cancelled order', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: userId,
    price: 10,
    status: OrderStatus.Cancelled,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signin(userId))
    .send({
      token: 'test',
      orderId: order.id,
    })
    .expect(400);
});

it('returns 201 with valid inputs', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: userId,
    price: 10,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signin(userId))
    .send({
      token: 'test',
      orderId: order.id,
    })
    .expect(201);

  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  expect(chargeOptions['source']).toEqual('test');
  expect(chargeOptions['currency']).toEqual('gbp');
  expect(chargeOptions['amount']).toEqual(order.price * 100);
  expect(stripe.charges.create).toBeCalledTimes(1);

  const payment = await Payments.findOne({ orderId: order.id, stripeId: stripeIdRes });
  if (!payment) throw new Error("Payment wasn't found");
});
