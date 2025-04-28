/*
    This is a set of application-specific error codes that can be used to identify
    different types of errors that may occur in the application.

    Basic set includes just enough error codes to map them to most common HTTP status codes.

    Usage of AppError + ErrorCode is a replacement for polluting the code with a separate class
    for each error type (Java-style).
*/
export enum ErrorCode {
  NOT_ENOUGH_PERMISSIONS = 'NOT_ENOUGH_PERMISSIONS',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  NOT_FOUND = 'NOT_FOUND',
  INVALID_STATE = 'INVALID_STATE',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly message: string
  ) {
    super(message);
    this.name = 'AppError';
  }

  public toHttpCode(): number {
    switch (this.code) {
      case ErrorCode.NOT_ENOUGH_PERMISSIONS:
        return 403;
      case ErrorCode.INVALID_CREDENTIALS:
        return 401;
      case ErrorCode.NOT_FOUND:
        return 404;
      case ErrorCode.INVALID_STATE:
      case ErrorCode.VALIDATION_ERROR:
        return 400;
      case ErrorCode.TOO_MANY_REQUESTS:
        return 429;
      case ErrorCode.INTERNAL_SERVER_ERROR:
      default:
        return 500;
    }
  }
}
