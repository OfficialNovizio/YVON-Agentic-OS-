// Live fleet observability endpoint (TS-001 WI-3 slice) — read-only
import { NextResponse } from 'next/server';
import { fleetStats } from '@/lib/fleet';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(fleetStats());
}
