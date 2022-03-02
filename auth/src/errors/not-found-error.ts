import { CustomError } from './custom-error';

export class NotFoundError extends CustomError {
  statusCode = 404;
  constructor() {
    super('Trying to reach non-existing route');

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors(): { message: string; field?: string }[] {
    return [
      {
        message: 'Not Found',
      },
    ];
  }
}
