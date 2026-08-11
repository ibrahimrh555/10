import { z } from "zod";

export const notificationEnvelopeSchema = z.object({
  recipientId: z.string().min(1),
  type: z.string().min(1),
  payload: z.record(z.string(), z.unknown()),
});

export type NotificationEnvelope = z.infer<typeof notificationEnvelopeSchema>;
