const fs=require('fs');
const env=fs.readFileSync('dashboard/.env.local','utf8');
const get=k=>{const m=env.match(new RegExp('^'+k+'=(.*)$','m'));return m?m[1].trim():''};
const url=get('SUPABASE_URL'), key=get('SUPABASE_SERVICE_ROLE_KEY');
const H={apikey:key,Authorization:'Bearer '+key};
(async()=>{
  for(const t of ['chat_rooms','chat_messages','chat_threads','design_sessions']){
    try{
      const res=await fetch(url+'/rest/v1/'+t+'?select=*&limit=5',{headers:H,signal:AbortSignal.timeout(20000)});
      if(res.status!==200){ console.log('  '+t+' -> HTTP '+res.status); continue; }
      const rows=await res.json();
      console.log('  '+t+' -> '+rows.length+' rows (sample limit 5)');
      if(rows[0]) console.log('     cols: '+Object.keys(rows[0]).join(',').slice(0,200));
    }catch(e){ console.log('  '+t+' -> ERR '+e.message.slice(0,60)); }
  }
})().catch(e=>console.log('FAILED:',e.message));
