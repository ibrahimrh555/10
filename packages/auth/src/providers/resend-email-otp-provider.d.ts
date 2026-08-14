import { type EmailOtpProvider, type SendEmailOtpInput } from "./email-otp-provider";
export interface ResendClient {
    emails: {
        send(input: {
            from: string;
            to: string;
            subject: string;
            html: string;
            text: string;
        }): Promise<{
            data: unknown;
            error: {
                message: string;
            } | null;
        }>;
    };
}
export declare class ResendEmailOtpProvider implements EmailOtpProvider {
    private readonly from;
    private readonly client;
    constructor(apiKey: string, from: string, client?: ResendClient);
    sendCode({ email, code, expiresInMinutes }: SendEmailOtpInput): Promise<void>;
}
//# sourceMappingURL=resend-email-otp-provider.d.ts.map