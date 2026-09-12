const fs=require('fs');
const env=fs.readFileSync('dashboard/.env.local','utf8');
const get=k=>{const m=env.match(new RegExp('^'+k+'=(.*)$','m'));return m?m[1].trim():''};
const url=get('SUPABASE_URL'), key=get('SUPABASE_SERVICE_ROLE_KEY');
const H={apikey:key,Authorization:'Bearer '+key};
(async()=>{
  const r=await fetch(url+'/rest/v1/chat_messages?select=room_id,author_kind,author_id,content,created_at&order=created_at.desc&limit=60',{headers:H,signal:AbortSignal.timeout(25000)});
  const msgs=await r.json();
  console.log('recent messages:', msgs.length);
  const byRoom={};
  for(const m of msgs){ byRoom[m.room_id]=(byRoom[m.room_id]||0)+1; }
  const top=Object.entries(byRoom).sort((a,b)=>b[1]-a[1]).slice(0,3);
  console.log('busiest rooms:', JSON.stringify(top));
  const rid=top[0] && top[0][0];
  if(!rid) return;
  console.log('\n=== room '+String(rid).slice(0,8)+' (oldest first) ===');
  const conv=msgs.filter(m=>m.room_id===rid).sort((a,b)=>String(a.created_at).localeCompare(String(b.created_at)));
  for(const x of conv){
    const c=String(x.content||'').replace(/\s+/g,' ');
    console.log('  ['+(x.author_kind||'?')+'/'+String(x.author_id||'-').slice(0,12)+'] '+c.slice(0,130));
  }
})().catch(e=>console.log('FAILED:',e.message));
