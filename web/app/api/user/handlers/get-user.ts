import { NextResponse } from "next/server";
import { getUsers as getUsersService } from "@/lib/services/user";

export async function getUsers() {
    try {
        const users = await getUsersService();
        return NextResponse.json(users);
    } catch (error) {
        console.error('Error in GET /api/users:', error);
        return NextResponse.json(
            { error: "Internal Server Error" }, 
            { status: 500 }
        );
    }
}