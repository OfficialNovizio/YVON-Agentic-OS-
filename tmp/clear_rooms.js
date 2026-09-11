const fs=require('fs');
const env=fs.readFileSync('dashboard/.env.local','utf8');
const get=k=>{const m=env.match(new RegExp('^'+k+'=(.*)$','m'));return m?m[1].trim():''};
const url=get('SUPABASE_URL'), key=get('SUPABASE_SERVICE_ROLE_KEY');
const H={apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'};
const owner=fs.readFileSync('tmp/room_owner.txt','utf8').trim();
(async()=>{
  // 1. archive every currently-active room
  let res=await fetch(url+'/rest/v1/chat_rooms?archived_at=is.null',
    {method:'PATCH',headers:{...H,Prefer:'return=representation'},
     body:JSON.stringify({archived_at:new Date().toISOString()})});
  const arch=await res.json();
  console.log('archived rooms:', Array.isArray(arch)?arch.length:('HTTP '+res.status));

  // 2. create a fresh New-chat thread
  res=await fetch(url+'/rest/v1/chat_rooms',
    {method:'POST',headers:{...H,Prefer:'return=representation'},
     body:JSON.stringify({kind:'thread',owner_user_id:owner,title:null})});
  const created=await res.json();
  console.log('create status:', res.status);
  if(Array.isArray(created)&&created[0]){
    const r=created[0];
    console.log('  NEW ROOM id        :', r.id);
    console.log('  kind               :', r.kind);
    console.log('  owner_user_id      :', r.owner_user_id);
    console.log('  created_at         :', r.created_at);
    fs.writeFileSync('tmp/new_room.txt', r.id+'\n'+owner);
  } else {
    console.log('  create body:', JSON.stringify(created).slice(0,400));
  }
  // 3. verify
  res=await fetch(url+'/rest/v1/chat_rooms?select=id,kind,archived_at&archived_at=is.null',{headers:H});
  const live=await res.json();
  console.log('\nremaining ACTIVE rooms:', live.length);
  for(const r of live) console.log('  '+r.id+'  '+r.kind);
})().catch(e=>console.log('FAILED:',e.message));
