import { AppError } from '../../common/errors/app-error.js';

/** Generic auth failure — use for OTP / recovery flows to avoid account enumeration. */
export class AuthFlowError extends AppError {
  constructor(message = 'Request could not be completed.') {
    super({ statusCode: 400, code: 'AUTH_FLOW_ERROR', message });
    this.name = 'AuthFlowError';
  }
}
