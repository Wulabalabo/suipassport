import { NextRequest, NextResponse } from "next/server";
import { updateUser as updateUserService } from "@/lib/services/user";
import { stamp } from "@/types/db";

export async function updateUser(request: NextRequest) {
    try {
        const { address, stamp, points, name } = await request.json() as { address: string, stamp: stamp, points: number, name: string };
        console.log(address, stamp, points, name)
        const user = await updateUserService(address, { stamp, points, name });

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error in PATCH /api/users:', error);
        return NextResponse.json(
            { error: "Internal Server Error" }, 
            { status: 500 }
        );
    }
}