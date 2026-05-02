import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

const STACK = process.env.NODE_ENV || 'development'

export interface ErrorResponse {
  status: 'error';
  statusCode: number;
  message: string;
  stack?: string;
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (err instanceof AppError) {
    const errorResponse: ErrorResponse = {
      status: 'error',
      statusCode: err.statusCode,
      message: err.message,
    };

    if (isDevelopment) {
      errorResponse.stack = err.stack;
    }

    console.error(`[ERROR] ${err.statusCode} - ${err.message}`);
    res.status(err.statusCode).json(errorResponse);
    return;
  }

  const errorResponse: ErrorResponse = {
    status: 'error',
    statusCode: 500,
    message: isDevelopment ? err.message : 'Internal server error',
  };

  if (isDevelopment) {
    errorResponse.stack = err.stack;
  }

  console.error(`[UNEXPECTED ERROR] ${err.message}`, err);
  res.status(500).json(errorResponse);
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
