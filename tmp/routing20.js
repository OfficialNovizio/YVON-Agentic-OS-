const BASE='http://localhost:3000/api/chat/input-analysis';
// [task, expected-shape] — expected-shape is my ground truth, NOT given to the router
const T=[
 ["Rewrite this pull request review checklist so it catches auth flaws","single"],
 ["Our checkout button is broken on mobile Safari","single"],
 ["Model runway if we double the sales team","single"],
 ["Draft a mutual NDA we can send to a data vendor","single"],
 ["Figure out TAM for a compliance tool aimed at mid-market banks","single"],
 ["Write a cold email sequence targeting heads of risk","single"],
 ["Churn doubled this quarter, find the driver","single"],
 ["Is 49 dollars per seat the right pricing?","single"],
 ["Set up a nightly backup of the production database","single"],
 ["What is our VAT filing deadline this quarter?","single"],
 ["Audit our AWS IAM policies for privilege escalation","single"],
 ["Write the Q3 board memo covering burn and hiring","cross"],
 ["Plan the launch of our new analytics product next month","cross"],
 ["We need to hire two senior engineers and onboard them fast","cross"],
 ["Build a customer health score and wire it to the renewal playbook","cross"],
 ["Design a dashboard that shows churn, runway and pipeline together","cross"],
 ["Our SOC 2 audit is in 6 weeks, get us ready","cross"],
 ["Turn the customer interviews into a positioning statement and landing copy","cross"],
 ["Set up an outbound motion for the EU market including GDPR constraints","cross"],
 ["Run a pre-mortem on the pricing change before we announce it","cross"],
];
(async()=>{
  const rows=[];
  for(const [t,shape] of T){
    try{
      const r=await fetch(BASE,{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({content:t}),signal:AbortSignal.timeout(60000)});
      const j=await r.json(); const a=j?.analysis||j||{}; const ta=a.targetAgents||{};
      rows.push({t,shape,tier:j?.tier||a.tier||'?',primary:ta.primary||'(none)',
                 team:ta.team||[],scores:(a.scores||[]).slice(0,4)});
    }catch(e){rows.push({t,shape,tier:'ERR',primary:'ERR',team:[],scores:[]});}
  }
  console.log('TASK'.padEnd(64)+'SHAPE'.padEnd(7)+'TIER'.padEnd(8)+'PRIMARY'.padEnd(10)+'TEAM');
  console.log('-'.repeat(120));
  for(const r of rows)
    console.log(r.t.slice(0,62).padEnd(64)+r.shape.padEnd(7)+String(r.tier).padEnd(8)+String(r.primary).padEnd(10)+JSON.stringify(r.team));
  const c={}; for(const r of rows) c[r.primary]=(c[r.primary]||0)+1;
  console.log('\n=== PRIMARY DISTRIBUTION ===');
  for(const [k,v] of Object.entries(c).sort((a,b)=>b[1]-a[1])) console.log('  '+k.padEnd(10)+v);
  const tiers={}; for(const r of rows) tiers[r.tier]=(tiers[r.tier]||0)+1;
  console.log('\n=== TIER DISTRIBUTION ==='); for(const [k,v] of Object.entries(tiers)) console.log('  '+k.padEnd(10)+v);
  const meta=rows.filter(r=>r.primary==='meta').length;
  const multi=rows.filter(r=>r.team.length>1).length;
  const crossOK=rows.filter(r=>r.shape==='cross'&&r.team.length>2).length;
  console.log('\n=== HEALTH ===');
  console.log('  fallback-to-meta : '+meta+'/20   (was 9/18 = 50%)');
  console.log('  multi-agent teams: '+multi+'/20');
  console.log('  cross tasks with >2 agents: '+crossOK+'/'+rows.filter(r=>r.shape==='cross').length);
  console.log('\n=== SCORE EVIDENCE ===');
  for(const r of rows) console.log('  '+r.t.slice(0,46).padEnd(48)+' -> '+JSON.stringify(r.scores));
})();
