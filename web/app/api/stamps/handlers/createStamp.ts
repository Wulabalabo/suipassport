import { stampService } from "@/lib/db/index";
import { NextResponse } from "next/server";

export async function createStamp(request: Request) {
    try {
      const data = await request.json();
      const result = await stampService.create(data);
      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Failed to create claim stamp' },
        { status: 500 }
      );
    }
  }