const fs=require('fs');
const env=fs.readFileSync('dashboard/.env.local','utf8');
const get=k=>{const m=env.match(new RegExp('^'+k+'=(.*)$','m'));return m?m[1].trim():''};
const url=get('SUPABASE_URL'), key=get('SUPABASE_SERVICE_ROLE_KEY');
const H={apikey:key,Authorization:'Bearer '+key};
(async()=>{
  const res=await fetch(url+'/rest/v1/events?select=*&order=ts.desc&limit=60',{headers:H,signal:AbortSignal.timeout(30000)});
  const rows=await res.json();
  console.log('newest 60 events:');
  for(const r of rows.slice(0,26)){
    const p=r.payload??r.data??{};
    console.log('  '+String(r.ts).slice(11,19)+'  '+String(r.kind).padEnd(20)+'['+String(r.agent||'?').padEnd(6)+'] '+JSON.stringify(p).slice(0,120));
  }
  const tally={}; for(const r of rows) tally[r.kind]=(tally[r.kind]||0)+1;
  console.log('\ntally:'); for(const [k,v] of Object.entries(tally).sort((a,b)=>b[1]-a[1])) console.log('  '+k.padEnd(20)+v);
})().catch(e=>console.log('FAILED:',e.message));
