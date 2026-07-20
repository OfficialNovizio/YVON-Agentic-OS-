'use client';

import Link from 'next/link';
import type { Brand } from '@/lib/types';

function HealthRing({ health }: { health: number }) {
  const ringColor = health >= 90 ? 'border-emerald-400' : health >= 70 ? 'border-amber-400' : 'border-red-400';
  const textColor = health >= 90 ? 'text-emerald-600' : health >= 70 ? 'text-amber-600' : 'text-red-600';
  return (
    <div className={`w-[52px] h-[52px] rounded-full border-[3px] flex items-center justify-center ${ringColor}`}>
      <span className={`text-[15px] font-extrabold ${textColor}`}>{health}%</span>
    </div>
  );
}

export default function BrandCard({ brand }: { brand: Brand }) {
  return (
    <div className="group bg-white border border-slate-200 rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-amber-300 relative overflow-hidden">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">{brand.name}</h3>
          <p className="text-[11px] text-slate-500 font-medium uppercase tracking-[0.04em] mt-0.5">
            {brand.type}{brand.tier ? ` · ${brand.tier}` : ''}
          </p>
        </div>
        <HealthRing health={brand.health} />
      </div>

      <div className="text-[11px] text-slate-500 space-y-1 mb-4">
        <p>{brand.departments} · {brand.agents} agents</p>
        <p>Connectors: <span className="font-semibold text-slate-700">{brand.connectors.join(' · ')}</span></p>
        {brand.price && <p>Plan: <span className="font-semibold text-slate-700">{brand.price}/mo</span></p>}
      </div>

      {/* Actions — visible on hover */}
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Link
          href={`/brands/${brand.id}`}
          className="flex-1 text-center text-[11px] font-semibold py-1.5 rounded-md bg-amber-500 text-white hover:bg-amber-400 transition-colors"
        >
          Open
        </Link>
        <button className="text-[11px] font-semibold py-1.5 px-3 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
          Health
        </button>
        <button className="text-[11px] font-semibold py-1.5 px-3 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
          Connectors
        </button>
      </div>
    </div>
  );
}
