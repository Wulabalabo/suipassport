import { createClaimStamp } from "@/lib/services/claim-stamps";
import { claimStampSchema } from "@/lib/validations/claim-stamp";

import { NextResponse } from "next/server";

export async function updateStamps(request: Request) {
    try {
      const data = await request.json();
      
      // 验证输入数据
      const validatedData = claimStampSchema.parse(data);
      console.log( "validatedData", validatedData)
      const result = await createClaimStamp(validatedData);
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