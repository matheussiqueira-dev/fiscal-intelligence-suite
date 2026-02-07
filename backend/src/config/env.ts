import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(4000),
  JWT_SECRET: z.string().min(32).default('development-local-jwt-secret-please-change'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.0-flash'),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),
  RATE_LIMIT_WINDOW: z.string().default('1 minute'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000,http://localhost:5173'),
  ADMIN_EMAIL: z.string().email().default('admin@fiscal.local'),
  ADMIN_PASSWORD: z.string().min(8).default('Admin@12345'),
  ANALYST_EMAIL: z.string().email().default('analyst@fiscal.local'),
  ANALYST_PASSWORD: z.string().min(8).default('Analyst@12345'),
});

export const env = envSchema.parse(process.env);

if (env.NODE_ENV === 'production' && env.JWT_SECRET.includes('replace_with_a_long_secret')) {
  throw new Error('In production, JWT_SECRET must be replaced by a secure secret.');
}

export const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim());
