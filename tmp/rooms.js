const fs=require('fs');
const env=fs.readFileSync('dashboard/.env.local','utf8');
const get=k=>{const m=env.match(new RegExp('^'+k+'=(.*)$','m'));return m?m[1].trim():''};
const url=get('SUPABASE_URL'), key=get('SUPABASE_SERVICE_ROLE_KEY');
const H={apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'};
(async()=>{
  const res=await fetch(url+'/rest/v1/chat_rooms?select=id,title,kind,department,archived_at,owner_user_id,created_at&order=created_at.desc',{headers:H,signal:AbortSignal.timeout(30000)});
  const rooms=await res.json();
  console.log('TOTAL rooms:', rooms.length);
  for(const r of rooms.slice(0,10))
    console.log('  '+(r.archived_at?'[archived] ':'[ACTIVE]   ')+String(r.id).slice(0,8)+'  '+String(r.kind||'').padEnd(10)+'  '+String(r.title||'(untitled)').slice(0,40));
  const active=rooms.filter(r=>!r.archived_at);
  console.log('\nactive rooms:', active.length);
  const owner = rooms.find(r=>r.owner_user_id)?.owner_user_id;
  console.log('owner_user_id sample:', owner);
  fs.writeFileSync('tmp/room_owner.txt', owner||'');
})().catch(e=>console.log('FAILED:',e.message));
