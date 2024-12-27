import { NextRequest, NextResponse } from "next/server";
import { deleteUser as deleteUserService } from "@/lib/services/user";

export async function deleteUser(request: NextRequest) {
    try {
        const { address } = await request.json() as { address: string };
        const user = await deleteUserService(address);

        if (!user) {
            return NextResponse.json(
                { error: "User not found" }, 
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error in DELETE /api/users:', error);
        return NextResponse.json(
            { error: "Internal Server Error" }, 
            { status: 500 }
        );
    }
}