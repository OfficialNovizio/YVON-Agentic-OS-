const BASE='http://localhost:3000/api/chat/input-analysis';
const TASKS=[
 "Review this pull request for security issues before we merge it",
 "Our landing page isn't converting — rewrite the hero section",
 "Draft the investor update for last quarter",
 "Check whether we're compliant with the new data privacy rules",
 "Model our runway if we hire three more engineers",
 "We need to hire a senior backend engineer",
 "Figure out how big the market is for this product",
 "Write a cold email sequence for outbound prospecting",
 "Our churn is climbing, figure out why customers are leaving",
 "Set up CI/CD for the new service",
 "Design a dashboard for the sales team",
 "Is our pricing right? Should we raise it?",
 "Plan the launch for next month",
 "Audit our cloud infrastructure security",
 "Write the Q3 board memo",
 "Turn our blog posts into a weekly newsletter",
 "What's our tax filing deadline this quarter?",
 "Run a pre-mortem on this strategy before we commit"
];
(async()=>{
  const rows=[];
  for(const t of TASKS){
    try{
      const r=await fetch(BASE,{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({content:t}),signal:AbortSignal.timeout(60000)});
      const j=await r.json();
      const a=j?.analysis||j||{};
      const ta=a.targetAgents||{};
      rows.push({task:t, tier:j?.tier||a.tier||'?', primary:ta.primary||a.primary||'(none)',
                 team:ta.team||a.team||[], scores:(a.scores||ta.scores||[]).slice(0,3)});
    }catch(e){ rows.push({task:t,tier:'ERR',primary:'ERR:'+String(e.message).slice(0,30),team:[],scores:[]}); }
  }
  console.log('TASK'.padEnd(58)+'TIER'.padEnd(10)+'PRIMARY'.padEnd(12)+'TEAM');
  console.log('-'.repeat(118));
  for(const r of rows) console.log(r.task.slice(0,56).padEnd(58)+String(r.tier).padEnd(10)+String(r.primary).padEnd(12)+JSON.stringify(r.team));
  console.log('\n=== ROUTING DISTRIBUTION ===');
  const c={}; for(const r of rows) c[r.primary]=(c[r.primary]||0)+1;
  for(const [k,v] of Object.entries(c).sort((a,b)=>b[1]-a[1])) console.log('  '+k+': '+v);
  console.log('\n=== TOP SCORES (why each was chosen) ===');
  for(const r of rows) console.log('  '+r.task.slice(0,44).padEnd(46)+' -> '+JSON.stringify(r.scores));
})();
