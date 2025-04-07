import { stampService } from "@/lib/db/index";
import { NextResponse } from "next/server";


export async function PATCH(request: Request) {
    try {
        const { stamp_id } = await request.json();
        const result = await stampService.increaseCount(stamp_id);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Failed to increase stamp count' }, { status: 500 });
    }
}