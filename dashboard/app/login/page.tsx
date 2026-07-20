'use client';

// Operator login (TS-001 WI-3b) — matches existing slate/amber design system.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function LoginPage() {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    });
    if (res.ok) {
      router.push('/');
      router.refresh();
    } else if (res.status === 503) {
      setError('Auth is disabled — set OPERATOR_KEY in dashboard/.env.local');
    } else {
      setError('Invalid operator key');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form onSubmit={submit} className="bg-white border border-slate-200 rounded-xl p-8 w-80">
        <div className="flex items-center gap-2 mb-1">
          <Lock size={16} className="text-amber-500" />
          <h1 className="text-base font-black text-slate-900">YVON</h1>
        </div>
        <p className="text-[11px] text-slate-500 uppercase tracking-[0.1em] mb-6">Operator access</p>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Operator key"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] mb-3 focus:outline-none focus:border-amber-400"
          autoFocus
        />
        {error && <p className="text-[11px] text-red-600 mb-3">{error}</p>}
        <button
          type="submit"
          className="w-full bg-slate-900 text-amber-400 rounded-lg py-2 text-[13px] font-semibold hover:bg-slate-800 transition-all"
        >
          Enter
        </button>
      </form>
    </div>
  );
}
