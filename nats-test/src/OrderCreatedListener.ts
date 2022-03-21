import { Message, Stan } from 'node-nats-streaming';
import { Listener } from './ListenerClass';
import { Subjects } from './subjects';

export class OrderCreatedListener extends Listener<any> {
  readonly subject = Subjects.OrderCreated;
  readonly queueGroupName = 'payments-service';

  onMessage(data: any, msg: Message): void {
    // Business logic
    console.log(data.title);

    // If everything is correct
    msg.ack();
  }

  constructor(client: Stan) {
    super(client);
  }
}
