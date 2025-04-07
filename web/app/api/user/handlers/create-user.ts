import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/lib/db/index";
import { createUserParams } from "@/types/userProfile";


export async function createOrUpdateUser(request: NextRequest) {
    try {
        const requestBody = await request.json()
        const validatedRequestBody = createUserParams.parse(requestBody)
        const user = await userService.createOrUpdate(validatedRequestBody);
        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/users:', error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}