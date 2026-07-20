export default function SettingsPage() {
  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-[13px] text-slate-500 mt-1">Platform configuration and tenant management.</p>
      </div>

      <div className="grid gap-4 max-w-[640px]">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em] mb-3">Pipeline Configuration</h2>
          <div className="text-[12px] text-slate-600 space-y-2">
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span>Budget ratio</span>
              <span className="font-mono font-semibold text-slate-800">15% (normal), 40% (small)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span>Harness gates</span>
              <span className="font-semibold text-emerald-600">All 5 active</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span>Plan-lock</span>
              <span className="font-semibold text-amber-600">Config pending (quinn)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span>Self-improver</span>
              <span className="font-semibold text-emerald-600">Active · Sun 00:00 UTC</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em] mb-3">Connected Brands</h2>
          <ul className="text-[12px] text-slate-600 space-y-1.5">
            <li className="flex justify-between"><span>Novizio</span><span className="text-slate-400">Owned Brand · 3 depts</span></li>
            <li className="flex justify-between"><span>Hourbour</span><span className="text-slate-400">Owned Brand · 2 depts</span></li>
            <li className="flex justify-between"><span>Boutique A</span><span className="text-slate-400">AgentX · Growth · $149/mo</span></li>
            <li className="flex justify-between"><span>Café B</span><span className="text-slate-400">AgentX · Starter · $49/mo</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
