import { z } from "zod";

export const realtimeEnvelopeSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  occurredAt: z.iso.datetime(),
});

export type RealtimeEnvelope = z.infer<typeof realtimeEnvelopeSchema>;
