import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';
import { writeFileSync, openSync } from 'node:fs';
const log=openSync('./.srvout.log','w');
const srv=spawn('node',['.next/standalone/server.js'],{detached:true,stdio:['ignore',log,log],env:{...process.env,PORT:'3000',HOSTNAME:'127.0.0.1'}});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const out={};
try{
  let up=false;
  for(let i=0;i<15;i++){try{const ac=new AbortController();const to=setTimeout(()=>ac.abort(),800);const r=await fetch('http://127.0.0.1:3000/tasks',{signal:ac.signal});clearTimeout(to);if(r.ok){up=true;break;}}catch{}await wait(300);}
  out.serverUp=up; if(!up)throw new Error('server down');
  const b=await chromium.launch({headless:true});
  const p=await b.newPage({viewport:{width:1280,height:900}});
  const r=await p.goto('http://127.0.0.1:3000/tasks',{waitUntil:'domcontentloaded',timeout:8000});
  out.http=r.status();
  out.heading=await p.getByRole('heading',{name:'Task Dispatch'}).isVisible().catch(()=>false);
  out.specFile=await p.getByText('store/tasks/TS-001.yaml').isVisible().catch(()=>false);
  await p.getByRole('button',{name:'Step'}).click().catch(()=>{});
  await wait(300);
  out.stepWorks=await p.getByText('Message received').isVisible().catch(()=>false);
  await p.screenshot({path:'/sessions/inspiring-zen-lamport/mnt/outputs/tasks_page.png',fullPage:true});
  out.screenshot='saved';
  await b.close(); out.RESULT='PASS';
}catch(e){out.RESULT='FAIL';out.err=String(e).split('\n')[0].slice(0,80);}
finally{try{process.kill(-srv.pid,'SIGKILL');}catch{}}
writeFileSync('./.probe.json',JSON.stringify(out));
process.exit(0);
