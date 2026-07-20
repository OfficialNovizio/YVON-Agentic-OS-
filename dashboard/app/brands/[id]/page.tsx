import Link from 'next/link';
import MetricCard from '@/components/MetricCard';
import { ArrowLeft } from 'lucide-react';

const DATA = {
  id:'boutique-a',name:'Boutique A',type:'AgentX',tier:'Growth',price:'$149/mo',health:78,
  thisWeek:{ postsReady:5,reviewsDone:2,nextDeadline:'Thursday' },
  content:{ instagram:3,stories:2,drafts:4 },
  reach:{ views:'1.2K',clicks:'84',ctr:'3.2%',trend:'up' as const },
  calendar:[
    { day:'MON',task:'New arrivals Instagram post',status:'done' as const },
    { day:'TUE',task:'Behind-the-scenes Story',status:'done' as const },
    { day:'WED',task:'Customer spotlight carousel',status:'pending' as const },
    { day:'THU',task:'Sale announcement + link',status:'draft' as const },
    { day:'FRI',task:'Weekend style inspiration',status:'draft' as const },
  ],
};

export default function BrandDetailPage({ params }: { params: { id: string } }) {
  const d = DATA;

  return (
    <div>
      <Link href="/" className="inline-flex items-center gap-1.5 text-[12px] font-medium text-amber-600 hover:text-amber-500 mb-4">
        <ArrowLeft size={14} /> Back to all brands
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">{d.name}
          <span className="text-[13px] font-medium text-slate-400 ml-2">{d.type} · {d.tier}</span>
        </h1>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <MetricCard label="This Week" value={`${d.thisWeek.postsReady} posts`} detail={`${d.thisWeek.reviewsDone} reviews · Next: ${d.thisWeek.nextDeadline}`} />
        <MetricCard label="Reach" value={d.reach.views} detail={`⬆ ${d.reach.clicks} clicks · ${d.reach.ctr} CTR`} color="emerald" />
        <MetricCard label="Content Quality" value="87%" detail="Ogilvy coherence · Good" color="emerald" />
        <MetricCard label="Plan" value={d.tier} detail={`${d.price}/mo · Next bill: Aug 1`} />
      </div>

      {/* Content Calendar */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em]">Content Calendar — This Week</h2>
        </div>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.06em] border-b border-slate-100">
              <th className="py-2 px-5 w-[60px]">Day</th><th className="py-2 px-5">Task</th><th className="py-2 px-5 w-[90px]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {d.calendar.map((row) => (
              <tr key={row.day} className="hover:bg-slate-50 transition-colors">
                <td className="py-2.5 px-5 font-mono text-[11px] text-slate-400">{row.day}</td>
                <td className="py-2.5 px-5 text-slate-700">{row.task}</td>
                <td className="py-2.5 px-5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    row.status === 'done' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    row.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>{row.status.toUpperCase()}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
