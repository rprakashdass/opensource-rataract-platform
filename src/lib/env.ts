import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().or(z.string().min(1)),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  GMAIL_USER: z.string().email().optional().or(z.string().length(0)),
  GMAIL_APP_PASSWORD: z.string().min(1).optional().or(z.string().length(0)),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

const isServer = typeof window === "undefined";

function validateEnv() {
  const clientParsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });

  if (!clientParsed.success) {
    console.error("❌ Invalid client-side environment variables:", clientParsed.error.format());
    if (isServer) {
      throw new Error("Invalid client-side environment variables");
    }
  }

  if (isServer) {
    const serverParsed = serverEnvSchema.safeParse({
      DATABASE_URL: process.env.DATABASE_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      GMAIL_USER: process.env.GMAIL_USER,
      GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    });

    if (!serverParsed.success) {
      console.warn("⚠️ Warning: Missing or invalid server-side environment variables:");
      console.warn(serverParsed.error.format());
    }

    return {
      ...clientParsed.data,
      ...serverParsed.data,
    };
  }

  return {
    ...clientParsed.data,
    DATABASE_URL: "",
    NEXTAUTH_SECRET: "",
    GMAIL_USER: "",
    GMAIL_APP_PASSWORD: "",
    SUPABASE_SERVICE_ROLE_KEY: "",
  };
}

export const env = validateEnv();
export type Env = typeof env;
export default env;
