import { PaymentCreatedEvent, Publisher, Subjects } from '@yn-projects/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
