import { NextResponse } from "next/server";

import { stampService } from "@/lib/db/index";

export async function getStamps() {
    try {
      const result = await stampService.getAll();
      return NextResponse.json(result);
    } catch (error) {
      console.error('Error fetching stamps:', error);
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : 'Failed to fetch stamps' },
        { status: 500 }
      );
    }
  }
  