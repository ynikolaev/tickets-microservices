import { CustomError } from './custom-error';

export class BadRequestError extends CustomError {
  statusCode = 401;
  constructor(public message: string) {
    super('Bad Request Error ' + message);

    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors(): { message: string; field?: string }[] {
    return [{ message: this.message }];
  }
}
