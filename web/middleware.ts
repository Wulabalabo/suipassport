import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/jwtManager'

export const config = {
  matcher: [
    '/api/:path*',
    '/user',
    '/user/(?!\\[id\\])[^/]*$',
    '/admin/:path*'
  ],
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin')
  const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')

  // 允许 API 路由的 OPTIONS 和 GET 请求通过
  if (isApiRoute && (request.method === 'OPTIONS' || request.method === 'GET')) {
    return NextResponse.next()
  }

  // 从 cookie 中获取 token
  const token = request.cookies.get('auth_token')?.value

  // token 验证失败的处理
  if (!token || !verifyToken(token)) {
    // API 路由返回 401
    if (isApiRoute) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            ...(origin && { 'Access-Control-Allow-Origin': origin }),
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      )
    }
    
    // 非 API 路由重定向到根路由
    return NextResponse.redirect(new URL('/', request.url))
  }

  // ... 其余的 CORS 和 origin 验证逻辑保持不变 ...
  if (!origin) {
    return NextResponse.next()
  }

  if (process.env.NODE_ENV === 'development') {
    const isLocalhost = origin?.includes('localhost') || origin?.includes('127.0.0.1')
    if (isLocalhost) {
      return NextResponse.next()
    }
  }

  if (!origin.startsWith(allowedOrigin)) {
    return NextResponse.json(
      { error: 'Unauthorized access' },
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Credentials': 'true'
        }
      }
    )
  }

  const response = NextResponse.next()
  response.headers.set('Access-Control-Allow-Origin', origin)
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  
  return response
}