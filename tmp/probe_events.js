const fs=require('fs');
const env=fs.readFileSync('dashboard/.env.local','utf8');
const get=k=>{const m=env.match(new RegExp('^'+k+'=(.*)$','m'));return m?m[1].trim():''};
const url=get('SUPABASE_URL'), key=get('SUPABASE_SERVICE_ROLE_KEY');
const H={apikey:key,Authorization:'Bearer '+key};
(async()=>{
  const res=await fetch(url+'/rest/v1/events?select=kind,correlation,ts&order=ts.desc&limit=400',{headers:H,signal:AbortSignal.timeout(30000)});
  console.log('GET events ->', res.status);
  const rows=await res.json();
  if(!Array.isArray(rows)){console.log(JSON.stringify(rows).slice(0,400));return;}
  const tally={}; for(const r of rows) tally[r.kind]=(tally[r.kind]||0)+1;
  console.log('total rows fetched:', rows.length);
  console.log('--- kind tally (most recent 400) ---');
  for(const [k,v] of Object.entries(tally).sort((a,b)=>b[1]-a[1])) console.log('  '+k+': '+v);
  console.log('--- newest 5 ---');
  for(const r of rows.slice(0,5)) console.log('  '+r.ts+'  '+r.kind+'  corr='+String(r.correlation).slice(0,12));
})().catch(e=>console.log('FAILED: '+(e&&e.message)));
