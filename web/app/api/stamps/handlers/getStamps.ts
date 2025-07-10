import { NextResponse } from "next/server";

import { stampService } from "@/lib/db/index";

export async function getStamps() {
  try {
    const result = await stampService.getAll();
    
    // 转换为前端期望的格式
    const transformedResult = result.map(stamp => ({
      stamp_id: stamp.stamp_id,
      claim_code_start_timestamp: stamp.claim_code_start_timestamp,
      claim_code_end_timestamp: stamp.claim_code_end_timestamp,
      has_claim_code: !!stamp.claim_code,  // 计算这个字段
      total_count_limit: stamp.total_count_limit,
      user_count_limit: stamp.user_count_limit,
      claim_count: stamp.claim_count,
      public_claim: stamp.public_claim,
      promote_url: stamp.promote_url  // 包含新字段
    }));
    
    return NextResponse.json(transformedResult);
  } catch (error) {
    console.error('Error fetching stamps:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch stamps' },
      { status: 500 }
    );
  }
}
  