import { CustomError } from './custom-error';

export class NotAuthorisedError extends CustomError {
  reason = 'Not Authorised';
  statusCode = 401;

  constructor() {
    super('Not Authorised');

    // Only beacause we are extending a built in class
    Object.setPrototypeOf(this, NotAuthorisedError.prototype);
  }

  serializeErrors() {
    return [
      {
        message: this.reason,
      },
    ];
  }
}
