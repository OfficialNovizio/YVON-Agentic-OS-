const fs=require('fs');
const env=fs.readFileSync('dashboard/.env.local','utf8');
const get=k=>{const m=env.match(new RegExp('^'+k+'=(.*)$','m'));return m?m[1].trim():''};
const url=get('SUPABASE_URL'), key=get('SUPABASE_SERVICE_ROLE_KEY');
const H={apikey:key,Authorization:'Bearer '+key};
(async()=>{
  const r=await fetch(url+'/rest/v1/chat_messages?select=author_kind,author_id,content,created_at&room_id=eq.c0bd93e4-6150-4373-8824-bf3decc710fd&order=created_at.asc&limit=30',{headers:H,signal:AbortSignal.timeout(25000)});
  const msgs=await r.json();
  console.log('=== room c0bd93e4 ('+msgs.length+' msgs) ===');
  for(const x of msgs){
    const c=String(x.content||'').replace(/\s+/g,' ');
    console.log('  ['+(x.author_kind||'?')+'/'+String(x.author_id||'-').slice(0,14)+'] '+c.slice(0,170));
  }
})().catch(e=>console.log('FAILED:',e.message));
