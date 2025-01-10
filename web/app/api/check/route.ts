import { NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/lib/db';

export const GET = async () => {
    const isConnected = await checkDatabaseConnection();
    return NextResponse.json({ isConnected });
}