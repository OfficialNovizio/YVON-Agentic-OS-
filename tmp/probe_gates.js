const fs=require('fs');
const env=fs.readFileSync('dashboard/.env.local','utf8');
const get=k=>{const m=env.match(new RegExp('^'+k+'=(.*)$','m'));return m?m[1].trim():''};
const url=get('SUPABASE_URL'), key=get('SUPABASE_SERVICE_ROLE_KEY');
const H={apikey:key,Authorization:'Bearer '+key};
(async()=>{
  const res=await fetch(url+'/rest/v1/events?select=*&kind=in.(gate.blocked,phase.retrieve)&order=ts.desc&limit=40',{headers:H,signal:AbortSignal.timeout(30000)});
  const rows=await res.json();
  console.log('gate.blocked / phase.retrieve rows:', rows.length);
  console.log('--- raw payloads ---');
  for(const r of rows.slice(0,22)){
    const p = r.payload ?? r.data ?? r;
    console.log('  '+(r.ts||'').slice(11,19)+'  '+r.kind.padEnd(15)+'  '+JSON.stringify(p).slice(0,200));
  }
})().catch(e=>console.log('FAILED: '+(e&&e.message)));
