import { OrderCreatedEvent, Publisher, Subjects } from '@yn-projects/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
