import { NextResponse } from "next/server";
import { userService } from "@/lib/db/index";

export async function GET() {
  try {
    const statistics = await userService.getStatistics();
    return NextResponse.json(statistics);
  } catch (error) {
    console.error('Error in GET /api/user/statistics:', error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 