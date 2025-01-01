import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 配置中间件匹配的路径
export const config = {
  matcher: '/api/:path*'
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin')
  const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  // 开发环境下允许没有 origin 的请求通过
  if (!origin) {
    return NextResponse.next()
  }

  // 检查 origin 是否匹配允许的域名
  // 开发环境下允许 localhost 的不同端口
  if (process.env.NODE_ENV === 'development') {
    const isLocalhost = origin?.includes('localhost') || origin?.includes('127.0.0.1')
    if (isLocalhost) {
      return NextResponse.next()
    }
  }

  // 生产环境检查 origin
  if (!origin.startsWith(allowedOrigin)) {
    return NextResponse.json(
      { error: 'Unauthorized access' },
      { 
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )
  }

  return NextResponse.next()
} 