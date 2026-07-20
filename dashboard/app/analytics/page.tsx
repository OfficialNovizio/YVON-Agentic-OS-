import MetricCard from '@/components/MetricCard';

const PIPELINE_RUNS = [
  { agent:'spark',domain:'Creative Review',chunks:5,savings:'85%',quality:0.80 },
  { agent:'marcus',domain:'Financial Analysis',chunks:8,savings:'73%',quality:0.27 },
  { agent:'comply',domain:'Legal Compliance',chunks:8,savings:'56%',quality:1.00 },
  { agent:'board',domain:'Governance Decision',chunks:5,savings:'64%',quality:0.43 },
  { agent:'dev',domain:'Engineering Debug',chunks:5,savings:'77%',quality:0.50 },
];

const BRAND_STATS = [
  { name:'Novizio',content:1247,engagement:'12%⬆',quality:0.87 },
  { name:'Hourbour',content:843,engagement:'8%⬆',quality:0.91 },
  { name:'Boutique A',content:562,engagement:'5%⬆',quality:0.78 },
  { name:'Café B',content:328,engagement:'3%⬆',quality:0.83 },
];

export default function AnalyticsPage() {
  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Analytics</h1>
        <p className="text-[13px] text-slate-500 mt-1">Pipeline performance and brand metrics.</p>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <MetricCard label="Queries/Day" value="37" detail="Avg across 5 agents" />
        <MetricCard label="Avg Savings" value="73%" detail="39–89% range" color="emerald" />
        <MetricCard label="Quality Score" value="0.73" detail="Weighted avg" />
        <MetricCard label="Recovery Rate" value="1.6/run" detail="Chunks recovered per query" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Pipeline Runs */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100">
            <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em]">Live Pipeline Runs</h2>
          </div>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.06em] border-b border-slate-100">
                <th className="py-2 px-5">Agent</th><th className="py-2 px-5">Domain</th><th className="py-2 px-5">Chunks</th><th className="py-2 px-5">Savings</th><th className="py-2 px-5">Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {PIPELINE_RUNS.map(r => (
                <tr key={r.agent} className="hover:bg-slate-50">
                  <td className="py-2 px-5 font-semibold text-slate-700">{r.agent}</td>
                  <td className="py-2 px-5 text-slate-500">{r.domain}</td>
                  <td className="py-2 px-5 font-mono text-[11px]">{r.chunks}</td>
                  <td className="py-2 px-5 font-semibold text-emerald-600">{r.savings}</td>
                  <td className="py-2 px-5">
                    <span className={`font-semibold ${r.quality>=0.7?'text-emerald-600':r.quality>=0.3?'text-amber-600':'text-red-600'}`}>
                      {r.quality.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Brand Stats */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100">
            <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em]">Brand Performance</h2>
          </div>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.06em] border-b border-slate-100">
                <th className="py-2 px-5">Brand</th><th className="py-2 px-5">Content</th><th className="py-2 px-5">Engagement</th><th className="py-2 px-5">Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {BRAND_STATS.map(b => (
                <tr key={b.name} className="hover:bg-slate-50">
                  <td className="py-2 px-5 font-semibold text-slate-700">{b.name}</td>
                  <td className="py-2 px-5 font-mono text-[11px]">{b.content}</td>
                  <td className="py-2 px-5 text-emerald-600">{b.engagement}</td>
                  <td className="py-2 px-5">
                    <span className={`font-semibold ${b.quality>=0.8?'text-emerald-600':'text-amber-600'}`}>
                      {b.quality.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
