const fs=require('fs');
const env=fs.readFileSync('dashboard/.env.local','utf8');
const get=k=>{const m=env.match(new RegExp('^'+k+'=(.*)$','m'));return m?m[1].trim():''};
const url=get('SUPABASE_URL'), key=get('SUPABASE_SERVICE_ROLE_KEY');
const H={apikey:key,Authorization:'Bearer '+key};
(async()=>{
  const r=await fetch(url+'/rest/v1/chat_messages?select=room_id,author_kind,author_id,content,created_at&content=ilike.*offforum*&order=created_at.asc&limit=40',{headers:H,signal:AbortSignal.timeout(25000)});
  const msgs=await r.json();
  console.log('offforum messages:', msgs.length);
  const rooms=[...new Set(msgs.map(m=>m.room_id))];
  console.log('rooms:', rooms.map(x=>String(x).slice(0,8)).join(', '));
  const rid=rooms[0];
  const conv=msgs.filter(m=>m.room_id===rid);
  console.log('\n=== room '+String(rid).slice(0,8)+' ===');
  for(const x of conv){
    const c=String(x.content||'').replace(/\s+/g,' ');
    console.log('  ['+(x.author_kind||'?')+'/'+String(x.author_id||'-').slice(0,14)+'] '+c.slice(0,150));
  }
})().catch(e=>console.log('FAILED:',e.message));
