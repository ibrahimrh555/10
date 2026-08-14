import { type EmailOtpProvider, type SendEmailOtpInput } from "./email-otp-provider";
export declare class DevelopmentEmailOtpProvider implements EmailOtpProvider {
    private readonly logger;
    constructor(environment: string, logger?: Pick<Console, "info">);
    sendCode(input: SendEmailOtpInput): Promise<void>;
}
//# sourceMappingURL=development-email-otp-provider.d.ts.map