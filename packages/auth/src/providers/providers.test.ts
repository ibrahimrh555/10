import { describe, expect, it, vi } from "vitest";
import { DevelopmentEmailOtpProvider } from "./development-email-otp-provider";
import { EmailOtpDeliveryError } from "./email-otp-provider";
import { ResendEmailOtpProvider, type ResendClient } from "./resend-email-otp-provider";

const input = { email: "user@example.test", code: "123456", expiresInMinutes: 10 };
describe("email OTP providers", () => {
  it("logs development codes only through the injected logger", async () => { const info = vi.fn(); await new DevelopmentEmailOtpProvider("development", { info }).sendCode(input); expect(info).toHaveBeenCalledWith(expect.stringContaining("123456")); });
  it("forbids development delivery in production", () => { expect(() => new DevelopmentEmailOtpProvider("production")).toThrow(EmailOtpDeliveryError); });
  it("sends responsive HTML through Resend", async () => { const send = vi.fn(async () => ({ data: { id: "mail" }, error: null })); const client = { emails: { send } } satisfies ResendClient; await new ResendEmailOtpProvider("key", "10in@example.test", client).sendCode(input); expect(send).toHaveBeenCalledWith(expect.objectContaining({ to: input.email, html: expect.stringContaining("123456") })); });
  it("maps Resend failures to a delivery error", async () => { const client = { emails: { send: vi.fn(async () => ({ data: null, error: { message: "rejected" } })) } } satisfies ResendClient; await expect(new ResendEmailOtpProvider("key", "10in@example.test", client).sendCode(input)).rejects.toThrow(EmailOtpDeliveryError); });
});
