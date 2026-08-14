import { Resend } from "resend";
import { EmailOtpDeliveryError } from "./email-otp-provider";
const escapeHtml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
export class ResendEmailOtpProvider {
    from;
    client;
    constructor(apiKey, from, client) {
        this.from = from;
        this.client = client ?? new Resend(apiKey);
    }
    async sendCode({ email, code, expiresInMinutes }) {
        const result = await this.client.emails.send({ from: this.from, to: email, subject: "Votre code de connexion 10in", text: `Votre code 10in est ${code}. Il expire dans ${expiresInMinutes} minutes. Ignorez cet e-mail si vous n'êtes pas à l'origine de cette demande.`, html: `<!doctype html><html lang="fr"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f4f7f5;font-family:Arial,sans-serif;color:#16251d"><table role="presentation" width="100%"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" style="max-width:560px;background:#fff;border-radius:16px"><tr><td style="padding:32px"><h1>Votre code de connexion</h1><p>Saisissez ce code dans l'application 10in :</p><p style="font-size:36px;font-weight:700;letter-spacing:8px;text-align:center;background:#eef8f2;padding:20px;border-radius:12px">${escapeHtml(code)}</p><p>Ce code expire dans <strong>${expiresInMinutes} minutes</strong>.</p><p style="color:#63736b">Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail.</p></td></tr></table></td></tr></table></body></html>` });
        if (result.error)
            throw new EmailOtpDeliveryError(`Resend rejected the email: ${result.error.message}`);
    }
}
