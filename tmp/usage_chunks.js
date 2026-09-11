const KEY='sk-f80a095a1a7b44c193cea17da1f1f308';
const big='You are a meticulous engineering assistant. '.repeat(400);
(async()=>{
  // warm
  for(let i=0;i<2;i++){
    await fetch('https://api.deepseek.com/chat/completions',{method:'POST',
      headers:{'Content-Type':'application/json',Authorization:'Bearer '+KEY},
      body:JSON.stringify({model:'deepseek-flash',messages:[{role:'system',content:big},{role:'user',content:'ok'}],max_tokens:5}),
      signal:AbortSignal.timeout(60000)}).then(r=>r.json());
  }
  const res=await fetch('https://api.deepseek.com/chat/completions',{method:'POST',
    headers:{'Content-Type':'application/json',Authorization:'Bearer '+KEY},
    body:JSON.stringify({model:'deepseek-flash',messages:[{role:'system',content:big},{role:'user',content:'Reply with exactly: OK'}],
      max_tokens:20,stream:true,stream_options:{include_usage:true}}),
    signal:AbortSignal.timeout(120000)});
  const txt=await res.text();
  let n=0;
  for(const line of txt.split('\n')){
    if(!line.startsWith('data:'))continue;
    const raw=line.slice(5).trim(); if(!raw||raw==='[DONE]')continue;
    let j; try{j=JSON.parse(raw);}catch(e){continue;}
    n++;
    console.log('chunk '+n+' usage =', JSON.stringify(j.usage));
  }
})().catch(e=>console.log('FAILED:',e.message));
