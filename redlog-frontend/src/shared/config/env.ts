import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url().default('http://localhost:3000/api'),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration. Check your .env file.');
}

export const env = parsed.data;
