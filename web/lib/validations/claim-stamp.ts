import { z } from "zod";

export const claimStampSchema = z.object({
  stamp_id: z.string(),
  claim_code: z.string().or(z.number()).nullable(),
  claim_code_start_timestamp: z.string().or(z.number()).nullable(),
  claim_code_end_timestamp: z.string().or(z.number()).nullable(),
  total_count_limit: z.number().nullable(),
  user_count_limit: z.number().nullable(),
  public_claim: z.boolean()
});

export type ClaimStamp = z.infer<typeof claimStampSchema>;