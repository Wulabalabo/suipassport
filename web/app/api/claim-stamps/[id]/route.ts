import { NextResponse } from 'next/server';
import {
    getClaimStampById,
    updateClaimStamp,
    deleteClaimStamp
} from '@/lib/services/claim-stamps';
import { claimStampSchema } from '@/lib/validations/claim-stamp';

// 获取单个记录
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const result = await getClaimStampById(params.id);
        if (!result.success || !result.data) {
            return NextResponse.json(
                { success: false, error: 'Claim stamp not found' },
                { status: 404 }
            );
        }
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to fetch claim stamp' },
            { status: 500 }
        );
    }
}

// 更新记录
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const {id} = await params
      const data = await request.json();
      const validatedData = claimStampSchema.parse(data);
      console.log('Updating claim stamp:', id, validatedData); // 添加日志
      const result = await updateClaimStamp(id, validatedData);
      console.log('Update result:', result); // 添加日志
      
      if (!result.success || !result.data) {
        return NextResponse.json(
          { success: false, error: 'Claim stamp not found or no changes made' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(result);
    } catch (error) {
      console.error('Error updating claim stamp:', error); // 添加错误日志
      if (error instanceof Error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Failed to update claim stamp' },
        { status: 500 }
      );
    }
  }

// 删除记录
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const result = await deleteClaimStamp(params.id);
        if (!result.success || !result.data) {
            return NextResponse.json(
                { success: false, error: 'Claim stamp not found' },
                { status: 404 }
            );
        }
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to delete claim stamp' },
            { status: 500 }
        );
    }
}