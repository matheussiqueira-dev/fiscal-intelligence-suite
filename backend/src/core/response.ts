import { ApiError, ApiSuccess } from '../domain/types.js';

export const ok = <T>(data: T, meta?: Record<string, unknown>): ApiSuccess<T> => ({
  success: true,
  data,
  meta,
});

export const fail = (code: string, message: string, details?: unknown): ApiError => ({
  success: false,
  error: {
    code,
    message,
    details,
  },
});
