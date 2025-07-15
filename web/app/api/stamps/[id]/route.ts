import { NextResponse } from 'next/server';
import { stampService } from '@/lib/db/index';
import { undisplayStampFromDb } from '@/lib/services/stamps';

// 获取单个记录
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const result = await stampService.getById(params.id);
        if (!result) {
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
      const result = await stampService.update(id, data);
      console.log('Update result:', result); // 添加日志
      
      if (!result) {
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
        const { id } = params;
        const result = await stampService.delete(id);
        if (!result) {
            return NextResponse.json(
                { success: false, error: 'Claim stamp not found' },
                { status: 404 }
            );
        }
        return NextResponse.json(result);
    } catch (error) {
        console.error('DELETE /api/stamps/[id] error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to delete claim stamp' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        
        const result = await undisplayStampFromDb(id);
        
        // 检查查询是否成功
        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error || 'Database query failed' },
                { status: 500 }
            );
        }

        // 检查是否找到并更新了记录
        // D1数据库返回格式包含results数组
        const resultData = result.data as unknown as { results: any[] };
        if (!resultData?.results || resultData.results.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Claim stamp not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to undisplay claim stamp' },
            { status: 500 }
        );
    }
}