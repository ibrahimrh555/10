export interface SendEmailOtpInput {
    email: string;
    code: string;
    expiresInMinutes: number;
}
export interface EmailOtpProvider {
    sendCode(input: SendEmailOtpInput): Promise<void>;
}
export declare class EmailOtpDeliveryError extends Error {
    readonly name = "EmailOtpDeliveryError";
}
//# sourceMappingURL=email-otp-provider.d.ts.map