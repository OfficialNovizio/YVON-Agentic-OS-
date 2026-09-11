const KEY='sk-f80a095a1a7b44c193cea17da1f1f308';
const big='You are a meticulous engineering assistant. '.repeat(400);
async function call(stream){
  const body={model:'deepseek-flash',
    messages:[{role:'system',content:big},{role:'user',content:'Reply with exactly: OK'}],
    max_tokens:300};
  if(stream) body.stream_options={include_usage:true};
  const res=await fetch('https://api.deepseek.com/chat/completions',{method:'POST',
    headers:{'Content-Type':'application/json',Authorization:'Bearer '+KEY},
    body:JSON.stringify(body),signal:AbortSignal.timeout(120000)});
  if(!stream){ const j=await res.json(); return j.usage; }
  const txt=await res.text();
  const usages=[];
  for(const line of txt.split('\n')){
    if(!line.startsWith('data:'))continue;
    const raw=line.slice(5).trim(); if(!raw||raw==='[DONE]')continue;
    try{const j=JSON.parse(raw); if(j.usage) usages.push(j.usage);}catch(e){}
  }
  return usages[usages.length-1];
}
(async()=>{
  console.log('--- warm the cache first (2 non-streaming calls) ---');
  await call(false); const w=await call(false);
  console.log('  warm cached_tokens:', JSON.stringify(w.prompt_tokens_details));
  console.log('\n--- STREAMING call (what Hermes actually does) ---');
  const s=await call(true);
  console.log('  full usage object:', JSON.stringify(s));
  console.log('  cached_tokens    :', s && s.prompt_tokens_details ? s.prompt_tokens_details.cached_tokens : 'ABSENT');
})().catch(e=>console.log('FAILED:',e.message));
