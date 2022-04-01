import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  BadRequestError,
  NotAuthorisedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from '@yn-projects/common';

import { Order } from '../models/order';
import { stripe } from '../stripe';
import { Payments } from '../models/payments';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats';

// token will always succeed with test: tok_visa
const router = express.Router();

router.post(
  '/api/payments',
  requireAuth,
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('orderId').notEmpty().withMessage('OrderId is required'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) throw new NotFoundError();
    if (order.userId !== req.currentUser?.id) throw new NotAuthorisedError();
    if (order.status === OrderStatus.Cancelled) throw new BadRequestError('Cannot pay for cancelled order');

    const { id: stripeId } = await stripe.charges.create({
      currency: 'gbp',
      amount: order.price * 100,
      source: token,
    });

    const payment = Payments.build({
      stripeId,
      orderId,
    });
    await payment.save();

    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      stripeId: payment.stripeId,
      orderId: payment.orderId,
    });

    order.set({ status: OrderStatus.Complete });
    order.save();

    res.status(201).send({ id: payment.id });
  }
);

export { router as createChargeRouter };
