const fs=require('fs');
const env=fs.readFileSync('dashboard/.env.local','utf8');
const get=k=>{const m=env.match(new RegExp('^'+k+'=(.*)$','m'));return m?m[1].trim():''};
const HURL=get('HERMES_URL'), TOK=get('HERMES_TOKEN');
const MSG="I want a website and here is reference and make exactly like this - https://www.offforum.com/";
(async()=>{
  let route={};
  try{
    const r=await fetch('http://localhost:3000/api/chat/input-analysis',{method:'POST',
      headers:{'Content-Type':'application/json'},body:JSON.stringify({content:MSG}),
      signal:AbortSignal.timeout(60000)});
    const j=await r.json(); const a=j?.analysis||j||{};
    route={tier:j?.tier||a.tier,primary:(a.targetAgents||{}).primary,team:(a.targetAgents||{}).team||[]};
  }catch(e){route={error:String(e.message)};}
  console.log('=== ROUTING ===');
  console.log('  tier:',route.tier,'| primary:',route.primary,'| team:',JSON.stringify(route.team));

  const uid='t-'+Date.now(), rid='r-'+Date.now();
  const res=await fetch(HURL+'/v1/chat/stream',{method:'POST',
    headers:{Authorization:'Bearer '+TOK,'Content-Type':'application/json'},
    body:JSON.stringify({user_id:uid,room_id:rid,message:MSG,workspace:'default',
      mentions:route.team&&route.team.length?route.team:[route.primary||'meta']}),
    signal:AbortSignal.timeout(900000)});
  console.log('\n=== HERMES TURN ===');
  console.log('  HTTP',res.status);
  if(!res.ok){console.log('  ',(await res.text()).slice(0,400));return;}
  const rd=res.body.getReader();const dec=new TextDecoder();
  let buf='',kinds={},tools=[],t0=Date.now(),tokens=0,capture=[],corr=null,artifacts=[],notices=[];
  while(true){
    const {done,value}=await rd.read(); if(done)break;
    buf+=dec.decode(value,{stream:true});
    const parts=buf.split('\n'); buf=parts.pop();
    for(const line of parts){
      if(!line.startsWith('data:'))continue;
      const raw=line.slice(5).trim(); if(!raw)continue;
      let ev; try{ev=JSON.parse(raw);}catch(e){continue;}
      const k=ev.kind||ev.type||'?';
      kinds[k]=(kinds[k]||0)+1;
      if(ev.correlation&&!corr) corr=ev.correlation;
      if(k==='token'){tokens++;continue;}
      if(k==='tool_call.start')tools.push(ev.toolName);
      if(k==='capture.progress')capture.push(ev.stage+':'+ev.pct+'%');
      if(k==='artifact')artifacts.push((ev.label||'?')+' '+String(ev.url||'').slice(-40));
      if(k==='notice')notices.push(String(ev.message||'').slice(0,110));
      if(k==='done')console.log('  DONE in',((Date.now()-t0)/1000).toFixed(1)+'s','| tokens',tokens);
      if(k==='error')console.log('  ERROR:',JSON.stringify(ev).slice(0,250));
    }
  }
  console.log('  correlation:',corr);
  console.log('  SSE kinds:',JSON.stringify(kinds));
  console.log('  TOOLS:',JSON.stringify(tools));
  console.log('  CAPTURE PROGRESS:',JSON.stringify(capture));
  console.log('  ARTIFACTS:',JSON.stringify(artifacts));
  console.log('  NOTICES:',JSON.stringify(notices.slice(0,6)));
  fs.writeFileSync('tmp/corr.txt',corr||'');
})().catch(e=>console.log('FAILED:',e&&e.message));
