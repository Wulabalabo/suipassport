import { NextResponse } from 'next/server';
import { queryD1 } from '@/lib/db';

export async function POST(request: Request) {
    try {
        // 验证请求体参数
        const body = await request.json();
        if (!body.stamp_id || !body.claim_code) {
            return NextResponse.json(
                { success: false, error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        const { stamp_id, claim_code } = body;
        const current_timestamp = Date.now(); // Get current Unix 
        const sql = `
    SELECT 
      claim_code,
      claim_code_start_timestamp,
      claim_code_end_timestamp,
      (claim_code = ?) as code_matches,
      (claim_code_start_timestamp IS NULL AND claim_code_end_timestamp IS NULL) as case1_no_timestamps,
      (claim_code_start_timestamp IS NOT NULL AND claim_code_end_timestamp IS NULL AND claim_code_start_timestamp <= ?) as case2_only_start,
      (claim_code_start_timestamp IS NULL AND claim_code_end_timestamp IS NOT NULL AND claim_code_end_timestamp >= ?) as case3_only_end,
      (claim_code_start_timestamp IS NOT NULL AND claim_code_end_timestamp IS NOT NULL AND claim_code_start_timestamp <= ? AND claim_code_end_timestamp >= ?) as case4_both_timestamps,
      CASE 
        WHEN claim_code = ? AND (
          (claim_code_start_timestamp IS NULL AND claim_code_end_timestamp IS NULL) OR
          (claim_code_start_timestamp IS NOT NULL AND claim_code_end_timestamp IS NULL AND claim_code_start_timestamp <= ?) OR
          (claim_code_start_timestamp IS NULL AND claim_code_end_timestamp IS NOT NULL AND claim_code_end_timestamp >= ?) OR
          (claim_code_start_timestamp IS NOT NULL AND claim_code_end_timestamp IS NOT NULL AND claim_code_start_timestamp <= ? AND claim_code_end_timestamp >= ?)
        )
        THEN 1
        ELSE 0
      END as valid
    FROM claim_stamps 
    WHERE stamp_id = ?`;

        const result = await queryD1(sql, [
            claim_code,        // 验证 claim_code 匹配
            current_timestamp, // case2 的时间戳比较
            current_timestamp, // case3 的时间戳比较
            current_timestamp, // case4 的开始时间戳比较
            current_timestamp, // case4 的结束时间戳比较
            claim_code,        // CASE WHEN 中的 claim_code 匹配
            current_timestamp, // CASE WHEN 中 case2 的时间戳比较
            current_timestamp, // CASE WHEN 中 case3 的时间戳比较
            current_timestamp, // CASE WHEN 中 case4 的开始时间戳比较
            current_timestamp, // CASE WHEN 中 case4 的结束时间戳比较
            stamp_id          // WHERE 条件
        ]);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: 'Database query failed' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            // 修改这里：result.data 的结构不同于预期
            valid: Array.isArray(result.data) && result.data[0]?.results?.[0]?.valid === 1
        });
    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Verification failed'
            },
            { status: 500 }
        );
    }
}