import { z } from "zod";

export const clientEnvironmentSchema = z.object({
  apiUrl: z.url(),
});

export const serverEnvironmentSchema = z.object({
  APP_ENV: z.enum(["development", "test", "production"]),
  CORS_ORIGIN: z.url(),
  DATABASE_URL: z.string().min(1),
});

export type ClientEnvironment = z.infer<typeof clientEnvironmentSchema>;
export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;
