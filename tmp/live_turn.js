const fs=require('fs');
const env=fs.readFileSync('dashboard/.env.local','utf8');
const get=k=>{const m=env.match(new RegExp('^'+k+'=(.*)$','m'));return m?m[1].trim():''};
const url=get('HERMES_URL'), tok=get('HERMES_TOKEN');
const uid='dsh-probe-'+Date.now(), rid='dsh-room-'+Date.now();
const SKIP=new Set(['token','thinking','ping']);
(async()=>{
  const body={user_id:uid, room_id:rid, message:'How should dev review a pull request?',
              workspace:'default', reference_context:null};
  const res=await fetch(url+'/v1/chat/stream',{method:'POST',
    headers:{Authorization:'Bearer '+tok,'Content-Type':'application/json'},
    body:JSON.stringify(body), signal:AbortSignal.timeout(300000)});
  console.log('HTTP', res.status);
  if(!res.ok){ console.log((await res.text()).slice(0,600)); return; }
  const rd=res.body.getReader(); const dec=new TextDecoder();
  let buf='', kinds=[], t0=Date.now(), tokens=0, n=0;
  while(true){
    const {done,value}=await rd.read(); if(done) break;
    buf+=dec.decode(value,{stream:true});
    const parts=buf.split('\n'); buf=parts.pop();
    for(const line of parts){
      if(!line.startsWith('data:')) continue;
      const raw=line.slice(5).trim(); if(!raw) continue;
      let ev; try{ ev=JSON.parse(raw);}catch(e){continue;}
      const k=ev.kind||ev.type||'?';
      if(k==='token'){tokens++;continue;}
      if(SKIP.has(k))continue;
      n++;
      if(n<=40) console.log('  '+(Date.now()-t0+'ms').padStart(9)+'  '+k+'  '+JSON.stringify(ev).slice(0,190));
      kinds.push(k);
      if(k==='done'||k==='error'||k==='__internal_done__'){ }
    }
  }
  console.log('\n=== EVENT KIND TALLY ===');
  const tally={}; for(const k of kinds) tally[k]=(tally[k]||0)+1;
  for(const [k,v] of Object.entries(tally)) console.log('  '+k+': '+v);
  console.log('  tokens streamed: '+tokens);
})().catch(e=>console.log('FAILED: '+(e&&e.message)));
