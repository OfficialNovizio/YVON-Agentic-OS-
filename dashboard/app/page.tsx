import BrandCard from '@/components/BrandCard';
import MetricCard from '@/components/MetricCard';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

const DATA = {
  brands: [
    { id:'novizio',name:'Novizio',type:'Owned Brand' as const,health:82,departments:'3 departments',agents:11,connectors:['Instagram','Shopify'],color:'#F59E0B' },
    { id:'hourbour',name:'Hourbour',type:'Owned Brand' as const,health:93,departments:'2 departments',agents:8,connectors:['Instagram'],color:'#0F766E' },
    { id:'boutique-a',name:'Boutique A',type:'AgentX' as const,tier:'Growth' as const,price:'$149/mo',health:78,departments:'Brand Studio · Product',agents:8,connectors:['Instagram','Shopify'],color:'#8B5CF6',industry:'Fashion Retail' },
    { id:'cafe-b',name:'Café B',type:'AgentX' as const,tier:'Starter' as const,price:'$49/mo',health:85,departments:'Brand Studio',agents:3,connectors:['Instagram'],color:'#EC4899',industry:'Food & Beverage' },
  ],
  pipeline: { tests:285,failures:0,avgSavings:'73%',harnessGates:5,avgConflicts:1.2 },
  activity: [
    { ok:true,text:'Pipeline ran 5 live queries — all domains passing',time:'06:30',meta:'spark · marcus · comply · board · dev' },
    { ok:true,text:'4,839 chunks rebuilt with quality scores (v2)',time:'04:20',meta:'chunkify · dev' },
    { ok:true,text:'3 RAG bugs fixed — quality_score, conflicts, freshness',time:'03:15',meta:'dev · quinn · harness' },
    { ok:false,text:'Financial analysis — 17 same-dept conflicts detected',time:'02:00',meta:'marcus · gate_conflicts' },
  ],
};

export default function BrandsPage() {
  const { brands, pipeline, activity } = DATA;

  return (
    <div>
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Connected Brands</h1>
        <p className="text-[13px] text-slate-500 mt-1">Health scores from pipeline data. Click a brand to open its dashboard.</p>
      </div>

      {/* Brand Grid — Hero */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 mb-8">
        {brands.map((b) => (
          <BrandCard key={b.id} brand={b} />
        ))}
        <Link
          href="/add-brand"
          className="border-2 border-dashed border-slate-200 rounded-xl p-5 flex flex-col items-center justify-center min-h-[200px] hover:border-amber-300 hover:bg-amber-50/50 transition-all cursor-pointer"
        >
          <PlusCircle size={28} className="text-slate-300 mb-2" />
          <p className="text-[12px] font-medium text-slate-400">Add New Brand</p>
        </Link>
      </div>

      {/* Pipeline Stats */}
      <div className="mb-8">
        <h2 className="text-[13px] font-bold text-slate-700 mb-3 flex items-center gap-2">
          Pipeline Health
          <span className="text-[11px] font-medium text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">{pipeline.tests} tests</span>
        </h2>
        <div className="grid grid-cols-4 gap-3">
          <MetricCard label="Tests Passing" value={pipeline.tests} detail="0 failures across 16 modules" color="emerald" />
          <MetricCard label="Avg Savings" value={pipeline.avgSavings} detail="22–89% range across domains" />
          <MetricCard label="Harness Gates" value={`${pipeline.harnessGates}/5`} detail="Auth · Reliability · Conflict · Priority · Quarantine" color="emerald" />
          <MetricCard label="Conflicts/Query" value={pipeline.avgConflicts} detail="Down from 14–26 after same-source fix" />
        </div>
      </div>

      {/* Activity Timeline */}
      <div>
        <h2 className="text-[13px] font-bold text-slate-700 mb-3">Recent Activity</h2>
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {activity.map((a, i) => (
            <div key={i} className="flex items-start gap-3 px-5 py-3.5">
              <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${a.ok ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-slate-700">{a.text}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{a.meta}</p>
              </div>
              <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
