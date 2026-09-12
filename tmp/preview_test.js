const BASE='https://hermes.yvon.in';
const CORR='27a2f9f2-d89f-4155-bb19-03376cf1c6c1';
const urls=[
  BASE+'/artifacts/novizio/'+CORR+'/_reference-capture/reference.html',
  BASE+'/artifacts/novizio/'+CORR+'/_reference-capture/reference.png',
  BASE+'/artifacts/novizio/'+CORR+'/scrape-report.md',
  BASE+'/artifacts/novizio/'+CORR+'/design.md',
];
(async()=>{
  for(const u of urls){
    try{
      const r=await fetch(u,{signal:AbortSignal.timeout(30000)});
      const ct=r.headers.get('content-type')||'';
      let extra='';
      if(r.ok && ct.includes('html')){
        const t=await r.text();
        extra=' bytes='+t.length+' title='+(t.match(/<title[^>]*>([^<]*)/i)||[])[1];
      }
      console.log((r.ok?'OK  ':'FAIL')+' '+r.status+'  '+u.replace(BASE,'')+extra);
    }catch(e){ console.log('ERR  '+u.replace(BASE,'')+'  '+e.message.slice(0,50)); }
  }
  // is the preview subdomain system alive?
  try{
    const r=await fetch('https://novizio.preview.yvon.in',{signal:AbortSignal.timeout(15000)});
    console.log('OK   '+r.status+'  https://novizio.preview.yvon.in (live dev-server preview)');
  }catch(e){ console.log('ERR  novizio.preview.yvon.in -> '+e.message.slice(0,60)); }
})();
