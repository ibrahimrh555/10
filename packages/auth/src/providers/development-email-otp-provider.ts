import { EmailOtpDeliveryError, type EmailOtpProvider, type SendEmailOtpInput } from "./email-otp-provider";
export class DevelopmentEmailOtpProvider implements EmailOtpProvider {
  constructor(environment: string, private readonly logger: Pick<Console, "info"> = console) {
    if (environment === "production") throw new EmailOtpDeliveryError("The development OTP provider is forbidden in production");
  }
  async sendCode(input: SendEmailOtpInput): Promise<void> { this.logger.info(JSON.stringify({ event: "development_email_otp", email: input.email, code: input.code, expiresInMinutes: input.expiresInMinutes })); }
}
