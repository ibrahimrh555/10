import { z } from "zod";

export const authEnvironmentSchema = z.object({
  AUTH_SECRET: z.string().min(32),
});

export type AuthEnvironment = z.infer<typeof authEnvironmentSchema>;
