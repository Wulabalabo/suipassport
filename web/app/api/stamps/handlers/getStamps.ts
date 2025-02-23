import { NextResponse } from "next/server";

import { getStampsFromDb } from "@/lib/services/stamps";
import { DbStampResponse } from "@/types/stamp";

export async function getStamps() {
    try {
      const result:DbStampResponse[]|undefined = await getStampsFromDb();
      return NextResponse.json(result);
    } catch (error) {
      console.error('Error fetching stamps:', error);
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : 'Failed to fetch stamps' },
        { status: 500 }
      );
    }
  }
  