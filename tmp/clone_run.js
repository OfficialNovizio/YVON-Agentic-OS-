const fs=require('fs');
const env=fs.readFileSync('dashboard/.env.local','utf8');
const get=k=>{const m=env.match(new RegExp('^'+k+'=(.*)$','m'));return m?m[1].trim():''};
const HURL=get('HERMES_URL'), TOK=get('HERMES_TOKEN');
const SB=get('SUPABASE_URL'), SK=get('SUPABASE_SERVICE_ROLE_KEY');
const MSG="I want to clone this website exactly - https://www.offforum.com/";
(async()=>{
  // 1. route
  let route={};
  try{
    const r=await fetch('http://localhost:3000/api/chat/input-analysis',{method:'POST',
      headers:{'Content-Type':'application/json'},body:JSON.stringify({content:MSG}),
      signal:AbortSignal.timeout(60000)});
    const j=await r.json(); const a=j?.analysis||j||{};
    route={tier:j?.tier||a.tier,primary:(a.targetAgents||{}).primary,team:(a.targetAgents||{}).team||[]};
  }catch(e){route={error:String(e.message)};}
  console.log('ROUTING: tier='+route.tier+' primary='+route.primary+' team='+JSON.stringify(route.team));

  const uid='c086a79f-89b8-4bba-8529-b4476dd74eb1';
  const rid='novizio-clone-'+Date.now();
  console.log('room:',rid);
  console.log('starting turn...');

  const res=await fetch(HURL+'/v1/chat/stream',{method:'POST',
    headers:{Authorization:'Bearer '+TOK,'Content-Type':'application/json'},
    body:JSON.stringify({user_id:uid,room_id:rid,message:MSG,workspace:'novizio',
      mentions:route.team&&route.team.length?route.team:[route.primary||'meta']}),
    signal:AbortSignal.timeout(1800000)});
  console.log('HTTP',res.status);
  if(!res.ok){console.log((await res.text()).slice(0,400));return;}
  const rd=res.body.getReader();const dec=new TextDecoder();
  let buf='',kinds={},tools=[],t0=Date.now(),tokens=0,capture=[],corr=null,arts=[],resp='';
  while(true){
    const {done,value}=await rd.read(); if(done)break;
    buf+=dec.decode(value,{stream:true});
    const parts=buf.split('\n'); buf=parts.pop();
    for(const line of parts){
      if(!line.startsWith('data:'))continue;
      const raw=line.slice(5).trim(); if(!raw)continue;
      let ev; try{ev=JSON.parse(raw);}catch(e){continue;}
      const k=ev.kind||ev.type||'?'; kinds[k]=(kinds[k]||0)+1;
      if(ev.correlation&&!corr)corr=ev.correlation;
      if(k==='token'){tokens++;continue;}
      if(k==='tool_call.start')tools.push(ev.toolName);
      if(k==='capture.progress')capture.push(ev.stage+':'+ev.pct+'%');
      if(k==='artifact')arts.push((ev.label||'?'));
      if(k==='done'){resp=String(ev.response||'');console.log('DONE '+(Date.now()-t0)/1000+'s tokens='+tokens);}
      if(k==='error')console.log('ERROR:',JSON.stringify(ev).slice(0,300));
    }
  }
  console.log('correlation:',corr);
  console.log('capture:',JSON.stringify(capture));
  console.log('artifacts:',JSON.stringify(arts));
  console.log('tools('+tools.length+'):',JSON.stringify(tools.slice(0,14)));
  console.log('--- RESPONSE[0:1200] ---');
  console.log(resp.slice(0,1200));
  fs.writeFileSync('tmp/clone_result.json',JSON.stringify({corr,route,capture,arts,tools,resp,room:rid},null,1));
})().catch(e=>console.log('FAILED:',e&&e.message));
