const fs=require('fs');
const env=fs.readFileSync('dashboard/.env.local','utf8');
const get=k=>{const m=env.match(new RegExp('^'+k+'=(.*)$','m'));return m?m[1].trim():''};
const url=get('SUPABASE_URL'), key=get('SUPABASE_SERVICE_ROLE_KEY');
const H={apikey:key,Authorization:'Bearer '+key};
(async()=>{
  const r=await fetch(url+'/rest/v1/chat_rooms?select=id,archived_at,venture_slug',{headers:H,signal:AbortSignal.timeout(25000)});
  const rooms=await r.json();
  const m=await fetch(url+'/rest/v1/chat_messages?select=id',{headers:H,signal:AbortSignal.timeout(25000),headers:{...H,Prefer:'count=exact',Range:'0-0'}});
  console.log('=== supabase ===');
  console.log('  chat_rooms total   :', rooms.length);
  console.log('  active (not archived):', rooms.filter(x=>!x.archived_at).length);
  console.log('  by venture         :', JSON.stringify(rooms.reduce((a,x)=>{const k=String(x.venture_slug);a[k]=(a[k]||0)+1;return a;},{})));
  console.log('  chat_messages range:', m.headers.get('content-range'));
})().catch(e=>console.log('FAILED:',e.message));
