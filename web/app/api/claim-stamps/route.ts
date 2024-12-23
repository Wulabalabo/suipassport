import { NextResponse } from 'next/server';
import { getClaimStamps, createClaimStamp } from '@/lib/services/claim-stamps';
import { claimStampSchema } from '@/lib/validations/claim-stamp';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stampId = searchParams.get('stampId');
    
    const result = await getClaimStamps(stampId);
    return NextResponse.json(result);
  } catch (error ) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch claim stamps' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // 验证输入数据
    const validatedData = claimStampSchema.parse(data);
    
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