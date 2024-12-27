import { NextResponse } from 'next/server';
import { queryD1 } from '@/lib/db';
import { bcs } from '@mysten/sui/bcs';
import { keccak256 } from 'js-sha3';
import { fromHex } from '@mysten/sui/utils';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { ClaimStampResponse } from '@/types';

export const config = {
    api:{
        responseLimit: false,
        bodyParser:{
            sizeLimit: '10mb'
        }
    }
}

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

        const { stamp_id, passport_id, last_time, claim_code } = body;
        const current_timestamp = Date.now(); // Get current Unix 
        const sql = `
        SELECT 
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
            claim_code,        // 验证码匹配
            current_timestamp, // 开始时间检查
            current_timestamp, // 结束时间检查
            current_timestamp, // 时间范围开始
            current_timestamp, // 时间范围结束
            stamp_id          // stamp_id 查询条件
        ]);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: 'Database query failed' },
                { status: 500 }
            );
        }
        const validData = result.data as unknown as {results:[{valid:number}]}
        const response: ClaimStampResponse = {
            success: true,
            valid: validData.results[0]?.valid === 1,
            signature: undefined
        };

        if (response.valid) {
            // 更新用户信息
            response.signature = await signMessage(passport_id, last_time);
        }
        console.log(response)
        return NextResponse.json(response);
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

const signMessage = async (passport_id: string, last_time: number) => {
    try {
        const claim_stamp_info = bcs.struct('ClaimStampInfo', {
            passport: bcs.Address,
            last_time: bcs.u64()
        });

        const claim_stamp_info_bytes = claim_stamp_info.serialize({
            passport: passport_id, 
            last_time
        }).toBytes();
        const hash_data = keccak256(claim_stamp_info_bytes);
        const hash_bytes = fromHex(hash_data);

        if (!process.env.ADDRESS_SECRET_KEY) {
            throw new Error('STAMP_SECRET_KEY is not set');
        }
        const keypair = Ed25519Keypair.fromSecretKey(process.env.ADDRESS_SECRET_KEY);
        const signature = await keypair.sign(hash_bytes);        
        return signature;
    } catch (error) {
        console.error('Signing error:', error);
        throw error;
    }
}
