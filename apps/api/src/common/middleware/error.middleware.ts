import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[Agomoni API Error]', {
    method: req.method,
    path: req.path,
    message: err?.message || 'Unknown error',
    stack: process.env.NODE_ENV === 'development' ? err?.stack : undefined,
  });

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access',
    });
  }

  const statusCode = err.status || err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Safe client response (no internal database/system exceptions leaked in production)
  const clientMessage =
    statusCode >= 500 && isProduction
      ? 'কিছু একটা সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।'
      : err.message || 'কিছু একটা সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।';

  return res.status(statusCode).json({
    success: false,
    message: clientMessage,
  });
};
