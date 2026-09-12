const fs=require('fs');
const env=fs.readFileSync('dashboard/.env.local','utf8');
const get=k=>{const m=env.match(new RegExp('^'+k+'=(.*)$','m'));return m?m[1].trim():''};
const url=get('SUPABASE_URL'), key=get('SUPABASE_SERVICE_ROLE_KEY');
const H={apikey:key,Authorization:'Bearer '+key};
(async()=>{
  const res=await fetch(url+'/rest/v1/chat_rooms?select=id,kind,department,venture_slug,archived_at&venture_slug=eq.novizio&order=created_at.desc',{headers:H,signal:AbortSignal.timeout(20000)});
  const rooms=await res.json();
  const act=rooms.filter(r=>!r.archived_at);
  console.log('novizio rooms:', rooms.length, '| active:', act.length);
  for(const r of act.slice(0,8)) console.log('   '+String(r.id).slice(0,8)+'  '+String(r.kind).padEnd(16)+'  dept='+String(r.department||'-'));
  if(act[0]) fs.writeFileSync('tmp/target_room.txt', act[0].id);
  // recent messages in the newest room
  if(act[0]){
    const m=await fetch(url+'/rest/v1/chat_messages?select=id,author_kind,content,created_at&room_id=eq.'+act[0].id+'&order=created_at.desc&limit=5',{headers:H,signal:AbortSignal.timeout(20000)});
    const msgs=await m.json();
    console.log('\nnewest room messages:', msgs.length);
    for(const x of msgs.slice(0,4)) console.log('   ['+x.author_kind+'] '+String(x.content).slice(0,70));
  }
})().catch(e=>console.log('FAILED:',e.message));
