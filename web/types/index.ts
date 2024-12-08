import { StampItem } from "@/types/stamp"

export type NetworkVariables = {
    package: string,
    suiPassportRecord: string,
    stampDisplay: string,
    passportDisplay: string,
    stampOnlineEventRecord: string,
    stampOfflineEventRecord: string,
}

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
    admincap: string | undefined | null,
    stamps?: StampItem[]
}