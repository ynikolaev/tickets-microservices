import { Publisher, Subjects, TicketCreatedEvent } from '@yn-projects/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
