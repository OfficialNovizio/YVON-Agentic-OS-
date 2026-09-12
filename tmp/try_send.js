const fs=require('fs');
const room=fs.readFileSync('tmp/target_room.txt','utf8').trim();
const MSG="I want to clone this website exactly - https://www.offforum.com/";
(async()=>{
  console.log('POST /api/chat/send  room='+room.slice(0,8));
  const res=await fetch('http://localhost:3000/api/chat/send',{method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({roomId:room,content:MSG}),
    signal:AbortSignal.timeout(120000)});
  console.log('  HTTP',res.status);
  console.log('  body:',(await res.text()).slice(0,500));
})().catch(e=>console.log('FAILED:',e.message));
