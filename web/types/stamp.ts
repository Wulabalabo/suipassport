import { z } from "zod";

export type StampItem = {
    id: string 
    name: string
    imageUrl?: string
    description?: string
    points?: number
    timestamp?: number
    hasClaimCode?: boolean
    claimCodeStartTimestamp?: string
    claimCodeEndTimestamp?: string
    totalCountLimit?: number
    userCountLimit?: number
    claimCount?: number
    event?: string
    publicClaim?: boolean
}

export interface StampGridProps {
    items: StampItem[]
    currentPage?: number
    totalPages?: number
    onPageChange?: (page: number) => void
} 

export interface ClaimStampProps {
    stampId: string
    claimCode: string
    claimCodeStartTimestamp: number
    claimCodeEndTimestamp: number
}

export type DisplayStamp = StampItem & {
    isActive?: boolean
    eventId?: string
    isClaimable?: boolean
    claimedCount?: number
    isClaimed?: boolean
}

export interface VerifyStampParams {
    stamp_id: string;
    passport_id: string;
    last_time: number;
    claim_code: string;
}

export type VerifyClaimStampResponse = {
    success: boolean;
    valid: boolean;
    signature?: Uint8Array;
}


export interface DbStampResponse {
    stamp_id: string;
    claim_code_start_timestamp: string | null;
    claim_code_end_timestamp: string | null;
    has_claim_code: boolean;
    total_count_limit: number | null;
    user_count_limit: number | null;
    claim_count: number;
    public_claim: boolean;
}

export const createOrUpdateStampParams = z.object({
  stamp_id: z.string(),
  claim_code: z.string().or(z.number()).nullable(),
  claim_code_start_timestamp: z.string().or(z.number()).nullable(),
  claim_code_end_timestamp: z.string().or(z.number()).nullable(),
  total_count_limit: z.number().nullable(),
  user_count_limit: z.number().nullable(),
  public_claim: z.boolean()
});

export type CreateOrUpdateStampParams = z.infer<typeof createOrUpdateStampParams>;
