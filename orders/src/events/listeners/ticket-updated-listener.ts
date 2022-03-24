import { Listener, Subjects, TicketUpdatedEvent } from '@yn-projects/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  // will send event to one of services within this service groups
  queueGroupName: string = queueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message): Promise<void> {
    const { id, title, price, version } = data;
    const ticket = await Ticket.findByPrevVersion({ id, version });

    if (!ticket) throw new Error('Ticket nor found');

    ticket.set({ title, price });
    await ticket.save(); // increment version

    msg.ack();
  }
}
