import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
export interface DatabaseOptions { url: string; authToken?: string }
export function createDatabase(options: DatabaseOptions) {
  const client = createClient(options.authToken ? { url: options.url, authToken: options.authToken } : { url: options.url });
  return { client, db: drizzle(client, { schema }) };
}
export type Database = ReturnType<typeof createDatabase>["db"];
