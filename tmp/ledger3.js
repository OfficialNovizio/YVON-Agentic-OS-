const fs=require('fs');
const env=fs.readFileSync('dashboard/.env.local','utf8');
const get=k=>{const m=env.match(new RegExp('^'+k+'=(.*)$','m'));return m?m[1].trim():''};
const url=get('SUPABASE_URL'), key=get('SUPABASE_SERVICE_ROLE_KEY');
const H={apikey:key,Authorization:'Bearer '+key};
const CORR=fs.readFileSync('tmp/corr.txt','utf8').trim();
(async()=>{
  const res=await fetch(url+'/rest/v1/events?select=*&correlation=eq.'+CORR+'&order=ts.asc',{headers:H,signal:AbortSignal.timeout(30000)});
  const rows=await res.json();
  console.log('correlation:',CORR);
  console.log('events for THIS turn:',rows.length);
  if(!rows.length){console.log('  (none - checking newest instead)');return;}
  const tally={}; for(const r of rows) tally[r.kind]=(tally[r.kind]||0)+1;
  console.log('\n--- CAOS PHASE EVENTS (this turn) ---');
  for(const r of rows.filter(x=>/phase|gate|skill|run\./.test(x.kind))){
    const p=r.payload??r.data??{};
    console.log('  '+String(r.ts).slice(11,19)+'  '+String(r.kind).padEnd(18)+'['+String(r.agent||'?').padEnd(7)+']'+JSON.stringify(p).slice(0,170));
  }
  console.log('\n--- FULL TALLY ---');
  for(const [k,v] of Object.entries(tally).sort((a,b)=>b[1]-a[1])) console.log('  '+k.padEnd(22)+v);
})().catch(e=>console.log('FAILED:',e.message));
