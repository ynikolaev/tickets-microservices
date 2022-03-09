import { Publisher, Subjects, TicketUpdatedEvent } from '@yn-projects/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
