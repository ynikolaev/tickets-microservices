import { Listener, OrderStatus, PaymentCreatedEvent, Subjects } from '@yn-projects/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { queueGroupName } from './queue-group-name';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName: string = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message): Promise<void> {
    const { orderId } = data;
    const order = await Order.findById(orderId);

    if (!order) throw new Error("Order wasn't found");

    order.set({ status: OrderStatus.Complete });
    await order.save();

    msg.ack();
  }
}
