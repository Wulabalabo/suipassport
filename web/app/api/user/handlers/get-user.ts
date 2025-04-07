import { NextResponse } from "next/server";
import { userService } from "@/lib/db/index";

export async function getUsers() {
    try {
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    // 使用流式处理获取用户数据
                    for await (const batch of userService.getAllStream(500)) {
                        // 将每批数据转换为 JSON 字符串
                        const chunk = JSON.stringify(batch) + '\n';
                        controller.enqueue(new TextEncoder().encode(chunk));
                    }
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            }
        });

        // 返回流式响应
        return new Response(stream, {
            headers: {
                'Content-Type': 'application/json',
                'Transfer-Encoding': 'chunked',
                'Cache-Control': 'no-cache',
            },
        });
    } catch (error) {
        console.error('Error in GET /api/users:', error);
        return NextResponse.json(
            { error: "Internal Server Error" }, 
            { status: 500 }
        );
    }
}