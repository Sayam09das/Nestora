import { AppError } from './app-error.js';

export class MustChangePasswordError extends AppError {
  constructor(
    message = 'You must change your password before you can access this resource.',
  ) {
    super({
      statusCode: 403,
      code: 'MUST_CHANGE_PASSWORD',
      message,
    });
  }
}
