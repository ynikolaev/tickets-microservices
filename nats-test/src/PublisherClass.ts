import { Stan } from 'node-nats-streaming';
import { Subjects } from './subjects';

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Publisher<T extends Event> {
  abstract readonly subject: T['subject'];

  constructor(private client: Stan) {}

  async publish(data: T['data']): Promise<void> {
    const message = JSON.stringify(data);
    return new Promise((resolve, reject) => {
      this.client.publish(this.subject, message, (err) => {
        if (err) return reject(err);
        console.log(`Event ${this.subject} published`);
        resolve();
      });
    });
  }
}
