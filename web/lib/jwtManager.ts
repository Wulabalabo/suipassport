'use server'
import { JWTPayload, SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default_secret'
)

const TOKEN_NAME = 'auth_token'

interface TokenOptions {
  expiresIn?: string
  path?: string
  secure?: boolean
  httpOnly?: boolean
}

const defaultOptions: TokenOptions = {
  expiresIn: '1d',
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true
}

export async function generateToken(payload: object, options: TokenOptions = {}): Promise<string> {
  const { expiresIn } = { ...defaultOptions, ...options }
  const milliseconds = parseDuration(expiresIn || '1h')
  
  return new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor((Date.now() + milliseconds) / 1000))
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<object | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    console.error('Invalid token:', error)
    return null
  }
}

export async function setToken(payload: object, options: TokenOptions = {}): Promise<void> {
  const mergedOptions = { ...defaultOptions, ...options }
  const token = await generateToken(payload, mergedOptions)
  
  const cookieStore = await cookies()
  cookieStore.set(TOKEN_NAME, token, {
    expires: new Date(Date.now() + parseDuration(mergedOptions.expiresIn || '1h')),
    path: mergedOptions.path,
    secure: mergedOptions.secure,
    httpOnly: mergedOptions.httpOnly
  })
}

export async function removeToken(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(TOKEN_NAME)
}

export async function getToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(TOKEN_NAME)?.value || null
}

function parseDuration(duration: string): number {
  const unit = duration.slice(-1)
  const value = parseInt(duration.slice(0, -1))
  
  switch (unit) {
    case 'h': return value * 60 * 60 * 1000
    case 'd': return value * 24 * 60 * 60 * 1000
    case 'm': return value * 60 * 1000
    case 's': return value * 1000
    default: return 60 * 60 * 1000 // 默认1小时
  }
}