import { z } from 'zod';
import { AppError } from './errors.js';

export const parseOrThrow = <TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  payload: unknown,
): z.output<TSchema> => {
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    throw new AppError('Validation failed', 422, 'VALIDATION_ERROR', parsed.error.flatten());
  }

  return parsed.data as z.output<TSchema>;
};
