import { EmailOtpDeliveryError } from "./email-otp-provider";
export class DevelopmentEmailOtpProvider {
    logger;
    constructor(environment, logger = console) {
        this.logger = logger;
        if (environment === "production")
            throw new EmailOtpDeliveryError("The development OTP provider is forbidden in production");
    }
    async sendCode(input) { this.logger.info(JSON.stringify({ event: "development_email_otp", email: input.email, code: input.code, expiresInMinutes: input.expiresInMinutes })); }
}
