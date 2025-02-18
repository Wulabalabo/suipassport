import { NextResponse } from "next/server";

import { getClaimStamps } from "@/lib/services/claim-stamps";
import { SafeClaimStamp } from "@/types/db";

export async function getStamps() {
    try {
      const result:SafeClaimStamp[]|undefined = await getClaimStamps();
      console.log(result)
      return NextResponse.json(result);
    } catch (error) {
      console.error('Error fetching claim stamps:', error);
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : 'Failed to fetch claim stamps' },
        { status: 500 }
      );
    }
  }
  