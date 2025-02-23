import { type StampItem } from "./stamp"
import { z } from "zod"
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
    admincap: string,
    stamps?: StampItem[],
    collection_detail?: string[]
    passport_id?: string
}

export type DbUserResponse = {
    address: string
    points: number
    stamp_count: number
    name: string
}

export const createUserParams = z.object({
    address: z.string(),
    points: z.number(),
    stamp_count: z.number(),
    name: z.string()
})

export type CreateUserParams = z.infer<typeof createUserParams>
