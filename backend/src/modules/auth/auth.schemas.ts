import { z } from 'zod';

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const refreshBodySchema = z.object({
  token: z.string().min(10),
});
