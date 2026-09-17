import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('4000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().default('file:./dev.db'),
  JWT_SECRET: z.string().default('agomoni_jwt_secret_dev_key_super_secure_32_bytes_min'),
  JWT_REFRESH_SECRET: z.string().default('agomoni_refresh_secret_dev_key_super_secure_32_bytes_min'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  RAZORPAY_KEY_ID: z.string().default('rzp_test_agomoni_sample_key'),
  RAZORPAY_KEY_SECRET: z.string().default('rzp_test_agomoni_sample_secret'),
  RAZORPAY_WEBHOOK_SECRET: z.string().default('rzp_webhook_secret_dev'),
  AI_PROVIDER: z.enum(['DEVELOPMENT_MOCK', 'OPENAI', 'GEMINI', 'CLAUDE', 'QWEN', 'REPLICATE']).default('DEVELOPMENT_MOCK'),
  AI_API_KEY: z.string().optional(),
  QWEN_API_KEY: z.string().optional(),
  QWEN_BASE_URL: z.string().optional(),
  QWEN_MODEL: z.string().default('wanx-v1'),
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE_MB: z.string().default('5').transform((val) => parseInt(val, 10)),
});

export const config = envSchema.parse(process.env);
export default config;
