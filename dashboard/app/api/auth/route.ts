// Operator login (TS-001 WI-3b) — validates against OPERATOR_KEY env var.
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const key = process.env.OPERATOR_KEY;
  if (!key) {
    return NextResponse.json({ error: 'auth disabled — OPERATOR_KEY not set' }, { status: 503 });
  }
  const body = await req.json().catch(() => ({}));
  if (body.key !== key) {
    return NextResponse.json({ error: 'invalid key' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set('yvon_op', key, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12, // 12h operator session
  });
  return res;
}
