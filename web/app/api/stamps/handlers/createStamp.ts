import { createStampToDb } from "@/lib/services/stamps";
import { createOrUpdateStampParams } from "@/types/stamp";

import { NextResponse } from "next/server";

export async function createStamp(request: Request) {
    try {
      const data = await request.json();
      
      // 验证输入数据
      const validatedData = createOrUpdateStampParams.parse(data);
      console.log( "validatedData", validatedData)
      const result = await createStampToDb(validatedData);
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