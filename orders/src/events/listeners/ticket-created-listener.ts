import { Listener, Subjects, TicketCreatedEvent } from '@yn-projects/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  // will send event to one of services within this service groups
  queueGroupName: string = queueGroupName;

  async onMessage(data: TicketCreatedEvent['data'], msg: Message): Promise<void> {
    const { id, title, price } = data;
    const ticket = Ticket.build({ id, title, price });
    await ticket.save();

    msg.ack();
  }
}
