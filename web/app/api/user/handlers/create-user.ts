import { NextRequest, NextResponse } from "next/server";
import { createOrUpdateUser as createOrUpdateUserToDb} from "@/lib/services/user";
import { createUserParams } from "@/types/userProfile";


export async function createOrUpdateUser(request: NextRequest) {
    try {
        const requestBody = await request.json()
        const validatedRequestBody = createUserParams.parse(requestBody)
        const user = await createOrUpdateUserToDb(validatedRequestBody);
        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/users:', error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}