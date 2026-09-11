const fs=require('fs');
const env=fs.readFileSync('dashboard/.env.local','utf8');
const get=k=>{const m=env.match(new RegExp('^'+k+'=(.*)$','m'));return m?m[1].trim():''};
const HURL=get('HERMES_URL'), TOK=get('HERMES_TOKEN');
const MSG="I want a website and here is reference and make exactly like this - https://www.offforum.com/";
(async()=>{
  // STEP 1 — routing (dashboard-side, this is what assigns agent/team)
  let route={};
  try{
    const r=await fetch('http://localhost:3000/api/chat/input-analysis',{method:'POST',
      headers:{'Content-Type':'application/json'},body:JSON.stringify({content:MSG}),
      signal:AbortSignal.timeout(60000)});
    const j=await r.json(); const a=j?.analysis||j||{};
    route={tier:j?.tier||a.tier,primary:(a.targetAgents||{}).primary,team:(a.targetAgents||{}).team||[],reason:a.reason};
  }catch(e){route={error:String(e.message)};}
  console.log('=== STEP 1: ROUTING ===');
  console.log('  tier    :', route.tier);
  console.log('  primary :', route.primary);
  console.log('  team    :', JSON.stringify(route.team));
  console.log('  reason  :', route.reason);

  // STEP 2 — real turn through Hermes with the routed team as mentions
  const uid='t-'+Date.now(), rid='r-'+Date.now();
  const corr='c-'+Date.now();
  console.log('\n=== STEP 2: HERMES TURN (live) ===');
  const body={user_id:uid,room_id:rid,message:MSG,workspace:'default',
              mentions:route.team&&route.team.length?route.team:[route.primary||'meta'],
              correlation:corr};
  const res=await fetch(HURL+'/v1/chat/stream',{method:'POST',
    headers:{Authorization:'Bearer '+TOK,'Content-Type':'application/json'},
    body:JSON.stringify(body),signal:AbortSignal.timeout(900000)});
  console.log('  HTTP',res.status);
  if(!res.ok){console.log('  body:',(await res.text()).slice(0,500));return;}
  const rd=res.body.getReader();const dec=new TextDecoder();
  let buf='',kinds={},tools=[],t0=Date.now(),tokens=0;
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
      if(k==='token'){tokens++;continue;}
      if(k==='tool_call.start'){tools.push(ev.toolName);}
      if(k==='done'){
        console.log('  DONE in '+((Date.now()-t0)/1000).toFixed(1)+'s');
        console.log('  response[0:400]:',String(ev.response||'').slice(0,400).replace(/\n/g,' '));
      }
      if(k==='error') console.log('  ERROR:',JSON.stringify(ev).slice(0,300));
    }
  }
  console.log('  tokens streamed:',tokens);
  console.log('  SSE kinds:',JSON.stringify(kinds));
  console.log('  TOOLS CALLED ('+tools.length+'):',JSON.stringify(tools));
  fs.writeFileSync('tmp/live_test_corr.txt',corr);
  console.log('\n  correlation:',corr);
})().catch(e=>console.log('FAILED:',e&&e.message));
