import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/lib/db/index";

export async function getUsers(request: NextRequest) {
    try {
        const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
        const limit = parseInt(request.nextUrl.searchParams.get('limit') || '100');
        const cursor = (page - 1) * limit;

        const result = await userService.getAll(cursor, limit);
        
        return NextResponse.json({
            data: result.data,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(result.total / limit),
                totalItems: result.total,
                itemsPerPage: limit,
                nextCursor: result.nextCursor
            }
        });
    } catch (error) {
        console.error('Error in GET /api/users:', error);
        return NextResponse.json(
            { error: "Internal Server Error" }, 
            { status: 500 }
        );
    }
}