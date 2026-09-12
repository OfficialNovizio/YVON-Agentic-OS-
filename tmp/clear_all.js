const fs=require('fs');
const env=fs.readFileSync('dashboard/.env.local','utf8');
const get=k=>{const m=env.match(new RegExp('^'+k+'=(.*)$','m'));return m?m[1].trim():''};
const url=get('SUPABASE_URL'), key=get('SUPABASE_SERVICE_ROLE_KEY');
const H={apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'};
(async()=>{
  const res=await fetch(url+'/rest/v1/chat_rooms?archived_at=is.null',
    {method:'PATCH',headers:{...H,Prefer:'return=representation'},
     body:JSON.stringify({archived_at:new Date().toISOString()})});
  const done=await res.json();
  console.log('=== chat rooms archived:', Array.isArray(done)?done.length:('HTTP '+res.status));
  const chk=await fetch(url+'/rest/v1/chat_rooms?select=id,archived_at',{headers:H,signal:AbortSignal.timeout(20000)});
  const all=await chk.json();
  console.log('  total rooms   :', all.length);
  console.log('  active now    :', all.filter(x=>!x.archived_at).length);
})().catch(e=>console.log('FAILED:',e.message));
