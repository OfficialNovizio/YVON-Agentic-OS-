const BASE='https://hermes.yvon.in';
(async()=>{
  // find design.md across recent correlations
  const corrs=['1868527a-9cc5-4be2-b765-8902240688de','27a2f9f2-d89f-4155-bb19-03376cf1c6c1',
               'a3b42078-1594-4f18-a3b4-ba3c8f3a94af','273dbf24-2b56-4c45-a349-5ef79f6adc57',
               'c91139b3-c9bd-4e1b-ba22-8b6f71082e64','cd01ea29-d692-46df-b4bb-9fceb2f491c5',
               'dbcba1e2-c342-4c4c-b1f2-2e8e43932afd'];
  for(const c of corrs){
    for(const f of ['design.md','motion-profile.md','scrape-report.md']){
      try{
        const r=await fetch(BASE+'/artifacts/novizio/'+c+'/'+f,{method:'HEAD',signal:AbortSignal.timeout(15000)});
        if(r.ok) console.log('  OK   '+c.slice(0,8)+'/'+f);
      }catch(e){}
    }
  }
})();
