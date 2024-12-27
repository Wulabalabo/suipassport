import { syncUserPoints } from "@/lib/services/user"
import { NextResponse } from "next/server"

export async function PATCH(req: Request) {
    const { address, points } = await req.json()
    const result = await syncUserPoints(address, points)
    return NextResponse.json(result)
}