import { z } from "zod";

const optionalString = z.preprocess((value) => (value === "" ? undefined : value), z.string().optional());
const optionalEmail = z.preprocess((value) => (value === "" ? undefined : value), z.string().email().optional());
const optionalUrl = z.preprocess((value) => (value === "" ? undefined : value), z.string().url().optional());

const envSchema = z.object({
  APP_URL: z.string().url().default("http://localhost:3000"),
  SUPPORT_EMAIL: z.string().email().default("gerry@gocnscout.com"),
  DATABASE_URL: optionalString,
  DIRECT_URL: optionalString,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: optionalString,
  CLERK_SECRET_KEY: optionalString,
  CLERK_WEBHOOK_SECRET: optionalString,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optionalString,
  STRIPE_SECRET_KEY: optionalString,
  STRIPE_WEBHOOK_SECRET: optionalString,
  R2_ACCOUNT_ID: optionalString,
  R2_ACCESS_KEY_ID: optionalString,
  R2_SECRET_ACCESS_KEY: optionalString,
  R2_BUCKET_NAME: optionalString,
  R2_PUBLIC_BASE_URL: optionalUrl,
  BREVO_API_KEY: optionalString,
  BREVO_FROM_EMAIL: optionalEmail,
  BREVO_FROM_NAME: z.string().default("gocnscout"),
  NEXT_PUBLIC_POSTHOG_KEY: optionalString,
  NEXT_PUBLIC_POSTHOG_HOST: optionalUrl,
  SENTRY_DSN: optionalString,
  ADMIN_EMAILS: optionalString,
  ADMIN_BOOTSTRAP_SECRET: optionalString,
  DEEPSEEK_API_KEY: optionalString,
  DEEPSEEK_BASE_URL: optionalUrl,
  DEEPSEEK_MODEL: z.string().default("deepseek-chat"),
  GOOGLE_SEARCH_CONSOLE_SITE_URL: optionalString,
  GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL: optionalString,
  GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY: optionalString,
  GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON: optionalString,
});

export const env = envSchema.parse(process.env);

export function requireEnv(name: keyof typeof env) {
  const value = env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return String(value);
}
