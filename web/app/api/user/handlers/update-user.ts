import { NextRequest, NextResponse } from "next/server";
import { createOrUpdateUser as createOrUpdateUserToDb } from "@/lib/services/user";

export async function updateUser(request: NextRequest) {
    try {
        const { address, stamp_count, points, name } = await request.json() as { address: string, stamp_count: number, points: number, name: string };
        console.log(address, stamp_count, points, name)
        const user = await createOrUpdateUserToDb({ address, stamp_count, points, name });

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error in PATCH /api/users:', error);
        return NextResponse.json(
            { error: "Internal Server Error" }, 
            { status: 500 }
        );
    }
}