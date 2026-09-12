const BASE='https://hermes.yvon.in';
const C='27a2f9f2-d89f-4155-bb19-03376cf1c6c1';
(async()=>{
  const r=await fetch(BASE+'/artifacts/novizio/'+C+'/_reference-capture/asset-manifest.json',{signal:AbortSignal.timeout(30000)});
  console.log('asset-manifest HTTP', r.status);
  const m=await r.json();
  const entries=Object.entries(m).slice(0,6);
  console.log('  localized assets:', Object.keys(m).length);
  let ok=0;
  for(const [orig,local] of entries){
    const u=BASE+'/artifacts/novizio/'+C+'/_reference-capture/'+String(local).replace(/^\.?\//,'');
    try{
      const a=await fetch(u,{method:'HEAD',signal:AbortSignal.timeout(20000)});
      if(a.ok) ok++;
      console.log('   '+(a.ok?'OK  ':'FAIL')+' '+a.status+'  '+String(local).slice(0,64)+'  <-  '+String(orig).slice(-38));
    }catch(e){ console.log('   ERR  '+String(local).slice(0,60)); }
  }
  console.log('  assets reachable: '+ok+'/'+entries.length);
})();
