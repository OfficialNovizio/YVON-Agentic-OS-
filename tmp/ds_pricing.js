(async()=>{
  const urls=[
    'https://api-docs.deepseek.com/quick_start/pricing/',
    'https://api-docs.deepseek.com/zh-cn/quick_start/pricing/'
  ];
  for(const u of urls){
    try{
      const r=await fetch(u,{signal:AbortSignal.timeout(45000),headers:{'User-Agent':'Mozilla/5.0'}});
      console.log('=== '+u+' -> '+r.status+' ===');
      let h=await r.text();
      // strip tags, collapse whitespace
      h=h.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ');
      h=h.replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ');
      const i=h.toLowerCase().indexOf('flash');
      console.log(h.slice(Math.max(0,i-400), i+1600));
      console.log('');
    }catch(e){ console.log(u+' FAILED '+e.message); }
  }
})();
