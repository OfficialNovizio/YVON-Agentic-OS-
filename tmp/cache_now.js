const fs=require('fs');
const env=fs.readFileSync('dashboard/.env.local','utf8');
const get=k=>{const m=env.match(new RegExp('^'+k+'=(.*)$','m'));return m?m[1].trim():''};
const url=get('SUPABASE_URL'), key=get('SUPABASE_SERVICE_ROLE_KEY');
const H={apikey:key,Authorization:'Bearer '+key};
(async()=>{
  const res=await fetch(url+'/rest/v1/events?select=*&kind=eq.run.completed&order=ts.desc&limit=5',{headers:H,signal:AbortSignal.timeout(30000)});
  const rows=await res.json();
  console.log('recent run.completed:');
  for(const r of rows){
    const p=r.payload??r.data??{};
    const tu=p.trueUsage||{};
    console.log('  '+String(r.ts).slice(0,19)+'  llmCalls='+p.llmCalls+'  in='+tu.in+'  out='+tu.out+'  cacheRead='+tu.cacheRead+'  govWait='+p.governorWaitS);
  }
})().catch(e=>console.log('FAILED:',e.message));
