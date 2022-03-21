import { OrderCancelledEvent, Publisher, Subjects } from '@yn-projects/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
