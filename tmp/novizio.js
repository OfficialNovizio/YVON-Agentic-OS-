const fs=require('fs');
const env=fs.readFileSync('dashboard/.env.local','utf8');
const get=k=>{const m=env.match(new RegExp('^'+k+'=(.*)$','m'));return m?m[1].trim():''};
const url=get('SUPABASE_URL'), key=get('SUPABASE_SERVICE_ROLE_KEY');
const H={apikey:key,Authorization:'Bearer '+key};
(async()=>{
  // ventures
  let res=await fetch(url+'/rest/v1/ventures?select=*&limit=20',{headers:H,signal:AbortSignal.timeout(20000)});
  console.log('ventures HTTP', res.status);
  const v=await res.json();
  if(Array.isArray(v)){ console.log('ventures:', v.length);
    for(const x of v) console.log('   slug='+JSON.stringify(x.slug)+'  name='+JSON.stringify(x.name||x.title||'')); }
  else console.log('  ', JSON.stringify(v).slice(0,200));

  // rooms by venture (incl archived)
  res=await fetch(url+'/rest/v1/chat_rooms?select=id,kind,venture_slug,archived_at,title&order=created_at.desc',{headers:H,signal:AbortSignal.timeout(20000)});
  const rooms=await res.json();
  const byV={};
  for(const r of rooms){ const k=String(r.venture_slug); byV[k]=(byV[k]||0)+1; }
  console.log('\nchat_rooms total:', rooms.length, '| by venture_slug:', JSON.stringify(byV));
  console.log('archived:', rooms.filter(r=>r.archived_at).length, '| active:', rooms.filter(r=>!r.archived_at).length);
  const nov=rooms.filter(r=>String(r.venture_slug||'').toLowerCase().includes('noviz'));
  console.log('novizio rooms:', nov.length, '(archived '+nov.filter(r=>r.archived_at).length+')');
})().catch(e=>console.log('FAILED:',e.message));
