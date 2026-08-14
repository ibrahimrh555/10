export interface SendEmailOtpInput { email: string; code: string; expiresInMinutes: number }
export interface EmailOtpProvider { sendCode(input: SendEmailOtpInput): Promise<void> }
export class EmailOtpDeliveryError extends Error { override readonly name = "EmailOtpDeliveryError" }
