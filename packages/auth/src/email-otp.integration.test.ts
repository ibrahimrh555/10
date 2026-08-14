import { randomUUID } from "node:crypto";
import { unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { createDatabase, verification } from "@10in/db";
import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/libsql/migrator";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createAuth, type AuthInstance } from "./index";

const file = resolve(`auth-${randomUUID()}.db`);
const database = createDatabase({ url: `file:${file}` });
const codes = new Map<string, string>();
let auth: AuthInstance;
const environment = { NODE_ENV: "test" as const, BETTER_AUTH_SECRET: "integration-secret-that-is-at-least-32-characters", BETTER_AUTH_URL: "http://localhost:8787", OTP_PROVIDER: "development" as const };
const request = (path: string, body?: object, headers?: HeadersInit) => auth.handler(new Request(`http://localhost:8787/api/auth${path}`, { method: body ? "POST" : "GET", headers: { "content-type": "application/json", ...headers }, ...(body ? { body: JSON.stringify(body) } : {}) }));

beforeAll(async () => {
  await migrate(database.db, { migrationsFolder: resolve("../db/drizzle") });
  auth = createAuth({ db: database.db, environment, provider: { sendCode: async ({ email, code }) => { codes.set(email, code); } } });
}, 30_000);
afterAll(async () => { database.client.close(); await unlink(file).catch(() => undefined); });

describe("Email OTP BetterAuth flow", () => {
  it("rejects invalid email", async () => { expect((await request("/email-otp/send-verification-otp", { email: "invalid", type: "sign-in" }, { "x-forwarded-for": "192.0.2.1" })).status).toBe(400); });
  it("normalizes email and sends a six-digit code", async () => { const response = await request("/email-otp/send-verification-otp", { email: "  New.User@Example.TEST ", type: "sign-in" }, { "x-forwarded-for": "192.0.2.2" }); expect(response.status).toBe(200); expect(codes.get("new.user@example.test")).toMatch(/^\d{6}$/); });
  it("prevents resend inside 60 seconds", async () => { expect((await request("/email-otp/send-verification-otp", { email: "new.user@example.test", type: "sign-in" }, { "x-forwarded-for": "192.0.2.2" })).status).toBe(429); });
  it("rejects an incorrect OTP", async () => { expect((await request("/sign-in/email-otp", { email: "new.user@example.test", otp: "000000" })).status).toBe(400); });
  it("creates a user and session for a valid OTP", async () => { const otp = codes.get("new.user@example.test") ?? ""; const response = await request("/sign-in/email-otp", { email: "new.user@example.test", otp }); expect(response.status).toBe(200); const cookie = response.headers.get("set-cookie") ?? ""; expect(cookie).toContain("better-auth.session_token"); const sessionResponse = await request("/get-session", undefined, { cookie }); expect(sessionResponse.status).toBe(200); expect((await sessionResponse.json() as { user: { email: string } }).user.email).toBe("new.user@example.test"); expect((await request("/sign-out", {}, { cookie })).status).toBe(200); });
  it("signs in an existing user without duplicating it", async () => { const email = "new.user@example.test"; await database.db.delete(verification).where(eq(verification.identifier, `sign-in-otp-${email}`)); const sent = await request("/email-otp/send-verification-otp", { email, type: "sign-in" }, { "x-forwarded-for": "192.0.2.2" }); expect(sent.status).toBe(200); expect((await request("/sign-in/email-otp", { email, otp: codes.get(email) ?? "" }, { "x-forwarded-for": "192.0.2.2" })).status).toBe(200); });
  it("rejects an expired OTP", async () => { const email = "expired@example.test"; await request("/email-otp/send-verification-otp", { email, type: "sign-in" }, { "x-forwarded-for": "192.0.2.3" }); await database.db.update(verification).set({ expiresAt: new Date(0) }).where(eq(verification.identifier, `sign-in-otp-${email}`)); expect((await request("/sign-in/email-otp", { email, otp: codes.get(email) ?? "" }, { "x-forwarded-for": "192.0.2.3" })).status).toBe(400); });
  it("invalidates a code after too many attempts", async () => { const email = "attempts@example.test"; await request("/email-otp/send-verification-otp", { email, type: "sign-in" }, { "x-forwarded-for": "192.0.2.4" }); for (let attempt = 0; attempt < 5; attempt++) await request("/sign-in/email-otp", { email, otp: "999999" }, { "x-forwarded-for": `192.0.2.${10 + attempt}` }); expect((await request("/sign-in/email-otp", { email, otp: codes.get(email) ?? "" }, { "x-forwarded-for": "192.0.2.20" })).status).toBe(403); }, 15_000);
});
