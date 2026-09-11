const fs=require('fs');
const env=fs.readFileSync('dashboard/.env.local','utf8');
const get=k=>{const m=env.match(new RegExp('^'+k+'=(.*)$','m'));return m?m[1].trim():''};
const url=get('SUPABASE_URL'), key=get('SUPABASE_SERVICE_ROLE_KEY');
const H={apikey:key,Authorization:'Bearer '+key};
(async()=>{
  const res=await fetch(url+'/rest/v1/events?select=*&order=ts.desc&limit=120',{headers:H,signal:AbortSignal.timeout(30000)});
  const rows=await res.json();
  const t=rows.filter(r=>String(r.correlation||'').startsWith('c-1789105148877'));
  console.log('events for THIS turn:', t.length);
  const tally={}; for(const r of t) tally[r.kind]=(tally[r.kind]||0)+1;
  for(const [k,v] of Object.entries(tally).sort((a,b)=>b[1]-a[1])) console.log('  '+k.padEnd(20)+v);
  console.log('\n-- CAOS phase payloads --');
  for(const r of t.filter(x=>/phase|gate|skill|run\./.test(x.kind)).slice(0,14)){
    const p=r.payload??r.data??{};
    console.log('  '+String(r.ts).slice(11,19)+'  '+r.kind.padEnd(18)+JSON.stringify(p).slice(0,150));
  }
})().catch(e=>console.log('FAILED:',e.message));
