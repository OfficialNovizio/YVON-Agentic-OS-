const fs=require('fs');
const env=fs.readFileSync('dashboard/.env.local','utf8');
const get=k=>{const m=env.match(new RegExp('^'+k+'=(.*)$','m'));return m?m[1].trim():''};
const url=get('SUPABASE_URL'), key=get('SUPABASE_SERVICE_ROLE_KEY');
const H={apikey:key,Authorization:'Bearer '+key};
(async()=>{
  // newest novizio thread room
  const r=await fetch(url+'/rest/v1/chat_rooms?select=id,kind,venture_slug,archived_at,created_at&venture_slug=eq.novizio&order=created_at.desc&limit=6',{headers:H,signal:AbortSignal.timeout(20000)});
  const rooms=await r.json();
  for(const rm of rooms.slice(0,3)){
    const m=await fetch(url+'/rest/v1/chat_messages?select=author_kind,author_id,content,created_at&room_id=eq.'+rm.id+'&order=created_at.asc&limit=30',{headers:H,signal:AbortSignal.timeout(20000)});
    const msgs=await m.json();
    console.log('=== room '+String(rm.id).slice(0,8)+' ('+rm.kind+') messages='+msgs.length+' ===');
    for(const x of msgs){
      const c=String(x.content||'').replace(/\s+/g,' ');
      console.log('  ['+(x.author_kind||'?')+'/'+String(x.author_id||'-').slice(0,10)+'] '+c.slice(0,110));
    }
  }
})().catch(e=>console.log('FAILED:',e.message));
