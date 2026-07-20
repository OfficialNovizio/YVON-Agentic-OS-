// Agents Observability (TS-001 WI-4) — read-only fleet view.
// Extends existing dashboard conventions: MetricCard, slate/amber, table style.
import { Fragment } from 'react';
import MetricCard from '@/components/MetricCard';
import { fleetStats } from '@/lib/fleet';

export const dynamic = 'force-dynamic';

export default function AgentsPage() {
  const data = fleetStats();
  const { totals } = data;

  let lastDept = '';

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Agents</h1>
        <p className="text-[13px] text-slate-500 mt-1">
          Fleet observability — health, activity, and config state. Read-only.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <MetricCard label="Agents" value={totals.agents} detail={`${totals.departments} departments`} />
        <MetricCard label="Skills Compiled" value={totals.skillsCompiled} detail="dist/skills (generated)" color="emerald" />
        <MetricCard label="Invocations" value={totals.invocations} detail={`${totals.blocked} blocked outcomes`} color={totals.blocked > 0 ? 'amber' : 'slate'} />
        <MetricCard label="Configs Unfilled" value={totals.configsNeedingAttention} detail="agents with <FILL_IN> fields" color={totals.configsNeedingAttention > 0 ? 'amber' : 'emerald'} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em]">Fleet Roster</h2>
          <span className="text-[10px] text-slate-400">live from Teams/ · store/telemetry</span>
        </div>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.06em] border-b border-slate-100">
              <th className="py-2 px-5">Agent</th>
              <th className="py-2 px-5">Skills</th>
              <th className="py-2 px-5">Invocations</th>
              <th className="py-2 px-5">Completions</th>
              <th className="py-2 px-5">Config</th>
              <th className="py-2 px-5">Identity</th>
            </tr>
          </thead>
          <tbody>
            {data.agents.map((a) => {
              const deptRow = a.dept !== lastDept;
              lastDept = a.dept;
              return (
                <Fragment key={a.agent}>
                  {deptRow && (
                    <tr key={`d-${a.dept}`} className="bg-slate-50">
                      <td colSpan={6} className="py-1.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.06em]">
                        {a.dept}
                      </td>
                    </tr>
                  )}
                  <tr key={a.agent} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-2 px-5 font-semibold text-slate-800">{a.agent}</td>
                    <td className="py-2 px-5 text-slate-600">{a.skillsCompiled}</td>
                    <td className="py-2 px-5 text-slate-600">{a.invocations}</td>
                    <td className="py-2 px-5 text-slate-600">
                      {a.completions}
                      {a.blocked > 0 && <span className="ml-1.5 text-amber-600 font-semibold">({a.blocked} blocked)</span>}
                    </td>
                    <td className="py-2 px-5">
                      {a.configUnfilled > 0 ? (
                        <span className="text-amber-600 font-semibold">{a.configUnfilled} unfilled</span>
                      ) : (
                        <span className="text-emerald-600">complete</span>
                      )}
                    </td>
                    <td className="py-2 px-5 text-slate-500">{a.identity ?? '—'}</td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
