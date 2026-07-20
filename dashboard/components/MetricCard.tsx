export default function MetricCard({
  label, value, detail, color = 'slate',
}: {
  label: string; value: string | number; detail?: string; color?: 'emerald' | 'amber' | 'slate';
}) {
  const valueColor = { emerald: 'text-emerald-600', amber: 'text-amber-600', slate: 'text-slate-900' }[color];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.04em] mb-1.5">{label}</p>
      <p className={`text-[22px] font-extrabold ${valueColor}`}>{value}</p>
      {detail && <p className="text-[11px] text-slate-400 mt-1">{detail}</p>}
    </div>
  );
}
