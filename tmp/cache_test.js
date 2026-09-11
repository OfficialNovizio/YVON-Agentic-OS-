const KEY='sk-f80a095a1a7b44c193cea17da1f1f308';
const big='You are a meticulous engineering assistant. '.repeat(400);
(async()=>{
  for(let i=1;i<=2;i++){
    const t=Date.now();
    const res=await fetch('https://api.deepseek.com/chat/completions',{method:'POST',
      headers:{'Content-Type':'application/json',Authorization:'Bearer '+KEY},
      body:JSON.stringify({model:'deepseek-flash',
        messages:[{role:'system',content:big},{role:'user',content:'Reply with exactly: OK'}],
        max_tokens:300}),
      signal:AbortSignal.timeout(120000)});
    const j=await res.json();
    const u=j.usage||{};
    console.log('call '+i+' ('+(Date.now()-t)+'ms)');
    console.log('  prompt_tokens      :',u.prompt_tokens);
    console.log('  completion_tokens  :',u.completion_tokens);
    console.log('  prompt_tokens_details:',JSON.stringify(u.prompt_tokens_details));
    console.log('  cache_hit_tokens   :',u.prompt_cache_hit_tokens,'| cache_miss:',u.prompt_cache_miss_tokens);
  }
})().catch(e=>console.log('FAILED:',e.message));
