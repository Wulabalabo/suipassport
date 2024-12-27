import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getUserByAddress as getUserByAddressService } from "@/lib/services/user";

export async function getUserByAddress(request: NextRequest) {
    try {   
        const address = request.nextUrl.searchParams.get('address');
        if (!address) {
            return NextResponse.json({ error: "Address is required" }, { status: 400 });
        }
        const users = await getUserByAddressService(address);
        return NextResponse.json(users);
    } catch (error) {
        console.error('Error in GET /api/users:', error);
        return NextResponse.json(
            { error: "Internal Server Error" }, 
            { status: 500 }
        );
    }
}