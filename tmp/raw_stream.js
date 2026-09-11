const KEY='sk-f80a095a1a7b44c193cea17da1f1f308';
const big='You are a meticulous engineering assistant. '.repeat(400);
(async()=>{
  const body={model:'deepseek-flash',
    messages:[{role:'system',content:big},{role:'user',content:'Reply with exactly: OK'}],
    max_tokens:20, stream:true, stream_options:{include_usage:true}};
  const res=await fetch('https://api.deepseek.com/chat/completions',{method:'POST',
    headers:{'Content-Type':'application/json',Authorization:'Bearer '+KEY},
    body:JSON.stringify(body),signal:AbortSignal.timeout(120000)});
  console.log('HTTP',res.status);
  const txt=await res.text();
  const lines=txt.split('\n').filter(l=>l.trim());
  console.log('total stream lines:', lines.length);
  console.log('--- LAST 6 RAW LINES ---');
  for(const l of lines.slice(-6)) console.log('  '+l.slice(0,300));
})().catch(e=>console.log('FAILED:',e.message));
