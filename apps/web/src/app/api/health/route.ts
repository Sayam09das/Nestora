import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({
    success: true,
    data: { status: 'ok', service: 'web' },
    timestamp: new Date().toISOString(),
  });
}
