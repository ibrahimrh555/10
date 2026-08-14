import { describe, expect, it, vi } from "vitest";
import { createDatabase } from "@10in/db";
import { createAuth } from "./index";

describe("BetterAuth configuration", () => {
  it("creates the 1.6.23 handler with the Drizzle SQLite adapter", () => {
    const { client, db } = createDatabase({ url: "file::memory:" });
    const auth = createAuth({ db, environment: { NODE_ENV: "test", BETTER_AUTH_SECRET: "test-secret-that-is-at-least-32-characters", BETTER_AUTH_URL: "http://localhost:8787", OTP_PROVIDER: "development" }, provider: { sendCode: vi.fn(async () => undefined) } });
    expect(auth.handler).toBeTypeOf("function");
    client.close();
  });
});
