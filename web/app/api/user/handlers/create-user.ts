import { NextRequest, NextResponse } from "next/server";
import { createUser as createUserService } from "@/lib/services/user";

export async function createUser(request: NextRequest) {
    try {
        const { address, stamps, points } = await request.json() as { address: string, stamps: string[], points: number };
        const user = await createUserService({
            address,
            stamps,
            points
        });

        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/users:', error);
        return NextResponse.json(
            { error: "Internal Server Error" }, 
            { status: 500 }
        );
    }
}