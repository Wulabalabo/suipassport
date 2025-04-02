import { StampItem } from "@/types/stamp"


export type UserProfile = {
    avatar: string
    collections: { fields: { id: { id: string }, size: number } },
    email: string,
    exhibit: string[],
    github: string,
    id: { id: string },
    introduction: string,
    last_time: number,
    name: string,
    points: number,
    x: string,
    current_user: string,
    superAdmincap: string,
    stamps?: StampItem[],
    collection_detail?: string[]
    passport_id?: string
    is_admin?: boolean
}

export type ClaimStampResponse = {
    success: boolean;
    valid: boolean;
    signature?: Uint8Array;
}

export interface DbResponse<T> {
    success: boolean;
    meta: unknown;
    results: T[];
}
