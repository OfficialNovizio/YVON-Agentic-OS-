const fs=require('fs');
const env=fs.readFileSync('dashboard/.env.local','utf8');
const get=k=>{const m=env.match(new RegExp('^'+k+'=(.*)$','m'));return m?m[1].trim():''};
const url=get('SUPABASE_URL'), key=get('SUPABASE_SERVICE_ROLE_KEY');
const H={apikey:key,Authorization:'Bearer '+key};
const CORR='1868527a-9cc5-4be2-b765-8902240688de';
(async()=>{
  const res=await fetch(url+'/rest/v1/events?select=*&correlation=eq.'+CORR+'&order=ts.asc',{headers:H,signal:AbortSignal.timeout(30000)});
  const rows=await res.json();
  console.log('events for this turn:', rows.length);
  const tally={}; for(const r of rows) tally[r.kind]=(tally[r.kind]||0)+1;
  for(const [k,v] of Object.entries(tally).sort((a,b)=>b[1]-a[1])) console.log('  '+String(k).padEnd(20)+v);
  console.log('\n--- CAOS / skills / gates ---');
  for(const r of rows.filter(x=>/phase|skill|gate|run\./.test(x.kind))){
    const p=r.payload??r.data??{};
    console.log('  '+String(r.ts).slice(11,19)+'  '+String(r.kind).padEnd(17)+JSON.stringify(p).slice(0,150));
  }
})().catch(e=>console.log('FAILED:',e.message));
