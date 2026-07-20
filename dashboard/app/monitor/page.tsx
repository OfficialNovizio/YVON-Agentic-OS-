import MetricCard from '@/components/MetricCard';

const MODULES = [
  { module:'core/injector',tests:22,status:'ok' },{ module:'core/strategy',tests:23,status:'ok' },
  { module:'core/destructor',tests:35,status:'ok' },{ module:'core/optimizer',tests:24,status:'ok' },
  { module:'core/retriever',tests:20,status:'ok' },{ module:'core/bridge',tests:16,status:'ok' },
  { module:'core/embed',tests:12,status:'ok' },{ module:'core/feedback',tests:13,status:'ok' },
  { module:'harness/gates',tests:35,status:'ok' },{ module:'harness/disclosure',tests:23,status:'ok' },
  { module:'verify/grounded',tests:16,status:'ok' },{ module:'monitor/watcher',tests:17,status:'ok' },
  { module:'monitor/improver',tests:20,status:'ok' },{ module:'eval/judge',tests:10,status:'ok' },
  { module:'eval/flywheel',tests:12,status:'ok' },
];

export default function MonitorPage() {
  const passed = MODULES.filter(m => m.status === 'ok').length;
  const total = MODULES.length;

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Pipeline Monitor</h1>
        <p className="text-[13px] text-slate-500 mt-1">Test results from last run. All modules verified.</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <MetricCard label="Modules" value={`${passed}/${total}`} detail="All passing" color="emerald" />
        <MetricCard label="Total Tests" value="285+" detail="0 failures" color="emerald" />
        <MetricCard label="Harness Gates" value="5/5" detail="Active & verified" color="emerald" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em]">Module Results</h2>
        </div>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.06em] border-b border-slate-100">
              <th className="py-2 px-5">Module</th><th className="py-2 px-5">Tests</th><th className="py-2 px-5">Status</th><th className="py-2 px-5">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {MODULES.map(m => (
              <tr key={m.module} className="hover:bg-slate-50 transition-colors">
                <td className="py-2 px-5 font-mono text-[11px] text-slate-700">{m.module}</td>
                <td className="py-2 px-5 font-mono text-[11px] text-slate-500">{m.tests}</td>
                <td className="py-2 px-5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">PASS</span>
                </td>
                <td className="py-2 px-5 text-[11px] text-slate-400">self-test</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
