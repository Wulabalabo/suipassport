export interface SafeUser {
    address: string;
    stamps: stamp[];  // JSON array stored as string
    points: number;
    name?: string;
}

export interface stamp {
    id: string;
    claim_count: number;
}

export interface SafeUpdateUser {
    stamp?: stamp;
    points?: number;
    name?: string;
}

export interface SafeClaimStamp {
    stamp_id: string;
    claim_code_start_timestamp: string | null;
    claim_code_end_timestamp: string | null;
    has_claim_code: boolean;
    total_count_limit: number | null;
    user_count_limit: number | null;
    claim_count: number;
    public_claim: boolean;
}