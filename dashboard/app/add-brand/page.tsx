'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

type ProvisionStatus = 'idle' | 'provisioning' | 'done' | 'error';

export default function AddBrandPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name:'', industry:'', depts:[] as string[], tier:'growth' });
  const [status, setStatus] = useState<ProvisionStatus>('idle');
  const [steps, setSteps] = useState<string[]>([]);

  const industries = ['Fashion Retail','Food & Beverage','Technology','Health & Wellness','Home & Garden','Professional Services'];
  const departments = [
    { id:'social',label:'Social Media',desc:'Content, scheduling, ads, community' },
    { id:'brand',label:'Brand & Design',desc:'Logo, identity, visual assets' },
    { id:'ecommerce',label:'E-Commerce',desc:'Pricing, analytics, operations' },
    { id:'support',label:'Customer Support',desc:'Research, feedback, PMF' },
  ];
  const tiers = [
    { id:'starter',name:'Starter',price:49,depts:1,agents:3 },
    { id:'growth',name:'Growth',price:149,depts:2,agents:8 },
    { id:'scale',name:'Scale',price:399,depts:4,agents:20 },
  ];

  async function provision() {
    setStatus('provisioning');
    const sequence = ['Create tenant graph vault','Copy agent definitions','Apply industry overrides','Wire connectors','Run smoke test'];
    for (let i = 0; i < sequence.length; i++) {
      setSteps(prev => [...prev, sequence[i]]);
      await new Promise(r => setTimeout(r, 600));
    }
    setStatus('done');
    setTimeout(() => router.push('/'), 1000);
  }

  if (status === 'provisioning' || status === 'done') {
    return (
      <div>
        <div className="mb-7">
          <h1 className="text-2xl font-extrabold text-slate-900">{status === 'done' ? 'Provisioned!' : 'Provisioning...'}</h1>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-md">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
              <span className="text-[12px] text-slate-700">{s}</span>
            </div>
          ))}
          {status === 'done' && <p className="text-[11px] text-emerald-600 font-semibold mt-3">Redirecting to Brands...</p>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link href="/" className="inline-flex items-center gap-1.5 text-[12px] font-medium text-amber-600 hover:text-amber-500 mb-4">
        <ArrowLeft size={14} /> Back
      </Link>
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Add New Brand</h1>
        <p className="text-[13px] text-slate-500 mt-1">Provision a new tenant under AgentX SaaS.</p>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-6 max-w-md">
        {[1,2,3].map(s => (
          <div key={s} className={`flex-1 h-1 rounded-full ${s <= step ? 'bg-amber-400' : 'bg-slate-200'}`} />
        ))}
      </div>

      <div className="max-w-md">
        {step === 1 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em]">Brand Name</label>
              <input className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
                placeholder="Boutique A" value={form.name} onChange={e => setForm({...form,name:e.target.value})} />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em]">Industry</label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                {industries.map(ind => (
                  <button key={ind} onClick={() => setForm({...form,industry:ind})}
                    className={`px-3 py-2 rounded-lg text-[11px] text-left border ${form.industry===ind?'bg-amber-50 border-amber-300 text-amber-700':'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                    {ind}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setStep(2)} disabled={!form.name||!form.industry}
              className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-[12px] font-semibold disabled:opacity-30 hover:bg-slate-800 transition-colors">
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <p className="text-[12px] text-slate-500">Select departments. Our agents handle the rest.</p>
            {departments.map(d => {
              const active = form.depts.includes(d.id);
              return (
                <button key={d.id} onClick={() => setForm({...form,depts:active?form.depts.filter(x=>x!==d.id):[...form.depts,d.id]})}
                  className={`w-full p-4 rounded-xl text-left border ${active?'bg-purple-50 border-purple-300':'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                  <div className={`text-[13px] font-bold ${active?'text-purple-700':'text-slate-700'}`}>{d.label}</div>
                  <div className="text-[11px] text-slate-500 mt-1">{d.desc}</div>
                </button>
              );
            })}
            <button onClick={() => setStep(3)} disabled={form.depts.length===0}
              className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-[12px] font-semibold disabled:opacity-30 hover:bg-slate-800 transition-colors">
              Continue
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <p className="text-[12px] text-slate-500">Choose a plan. Upgrade anytime.</p>
            <div className="grid grid-cols-3 gap-2">
              {tiers.map(t => (
                <button key={t.id} onClick={() => setForm({...form,tier:t.id})}
                  className={`p-3 rounded-xl text-center border ${form.tier===t.id?'bg-emerald-50 border-emerald-300':'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                  <div className="text-[12px] font-bold">{t.name}</div>
                  <div className="text-lg font-extrabold mt-1">${t.price}</div>
                  <div className="text-[10px] text-slate-400">/month</div>
                  <div className="text-[10px] text-slate-400 mt-1.5">{t.depts} dept · {t.agents} agents</div>
                </button>
              ))}
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-[11px] text-slate-600 space-y-1">
              <div><b>Brand:</b> {form.name} · <b>Industry:</b> {form.industry}</div>
              <div><b>Departments:</b> {form.depts.length} · <b>Tier:</b> {form.tier}</div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-[12px] font-semibold text-slate-600 hover:bg-slate-50">Back</button>
              <button onClick={provision} className="flex-1 py-2.5 bg-slate-900 text-white rounded-lg text-[12px] font-semibold hover:bg-slate-800 transition-colors">
                Create & Provision
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
