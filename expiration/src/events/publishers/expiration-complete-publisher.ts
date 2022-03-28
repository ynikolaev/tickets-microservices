import { ExpirationCompleteEvent, Publisher, Subjects } from '@yn-projects/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
