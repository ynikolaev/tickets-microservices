import { Message, Stan } from 'node-nats-streaming';
import { Listener } from './ListenerClass';
import { Subjects } from './subjects';
import { TicketCreatedEvent } from './ticket-created-event';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  readonly queueGroupName = 'payments-service';

  onMessage(data: TicketCreatedEvent['data'], msg: Message): void {
    // Business logic
    console.log(data.title);

    // If everything is correct
    msg.ack();
  }

  constructor(client: Stan) {
    super(client);
  }
}
