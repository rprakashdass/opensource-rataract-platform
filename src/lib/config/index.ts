import { z } from "zod";

/**
 * Configuration loader for the white-labeled application.
 */

const configSchema = z.object({
  // Application
  appName: z.string().min(1),
  appUrl: z.string().url(),
  nodeEnv: z.enum(["development", "production", "test"]),

  // Database
  databaseUrl: z.string().min(1),

  // Supabase
  supabaseUrl: z.string().url(),
  supabaseAnonKey: z.string().min(1),
  supabaseServiceRoleKey: z.string().min(1),

  // Auth
  authSecret: z.string().min(32),

  // White-label details
  orgSubName: z.string().default("District & Club Platform"),
  orgDescription: z.string().default("We are a service-oriented organization that strives to create a better world through volunteerism, community service, and professional development."),
  orgInstagram: z.string().url().default("https://instagram.com/rotaract"),
  orgLinkedin: z.string().url().default("https://linkedin.com/company/rotaract"),
});

export type Config = z.infer<typeof configSchema>;

export function loadConfig(): Config {
  const config = configSchema.parse({
    appName: process.env.NEXT_PUBLIC_APP_NAME || "Rotaract Platform",
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    nodeEnv: process.env.NODE_ENV || "development",
    databaseUrl: process.env.DATABASE_URL,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    authSecret: process.env.AUTH_SECRET,
    orgSubName: process.env.NEXT_PUBLIC_ORG_SUB_NAME || "District & Club Platform",
    orgDescription: process.env.NEXT_PUBLIC_ORG_DESCRIPTION || "We are a service-oriented organization that strives to create a better world through volunteerism, community service, and professional development.",
    orgInstagram: process.env.NEXT_PUBLIC_ORG_INSTAGRAM || "https://instagram.com/rotaract",
    orgLinkedin: process.env.NEXT_PUBLIC_ORG_LINKEDIN || "https://linkedin.com/company/rotaract",
  });

  return config;
}

// Singleton instance
let configInstance: Config | null = null;

export function getConfig(): Config {
  if (!configInstance) {
    configInstance = loadConfig();
  }
  return configInstance;
}
