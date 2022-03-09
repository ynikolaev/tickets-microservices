import { Stan } from 'node-nats-streaming';
import { Publisher } from './PublisherClass';
import { Subjects } from './subjects';
import { TicketCreatedEvent } from '../../nats-test/src/ticket-created-event';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;

  constructor(client: Stan) {
    super(client);
  }
}
