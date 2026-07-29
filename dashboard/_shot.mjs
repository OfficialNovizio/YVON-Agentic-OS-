import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const srv=spawn('node',['.next/standalone/server.js'],{detached:true,stdio:'ignore',env:{...process.env,PORT:'3000',HOSTNAME:'127.0.0.1'}});
const wait=ms=>new Promise(r=>setTimeout(r,ms));const out={};
try{
  let up=false;for(let i=0;i<15;i++){try{const a=new AbortController();const t=setTimeout(()=>a.abort(),800);const r=await fetch('http://127.0.0.1:3000/',{signal:a.signal});clearTimeout(t);if(r.ok){up=true;break;}}catch{}await wait(300);}
  out.up=up;if(!up)throw new Error('down');
  const b=await chromium.launch({headless:true});const p=await b.newPage({viewport:{width:1280,height:1000}});
  const r=await p.goto('http://127.0.0.1:3000/',{waitUntil:'networkidle',timeout:8000});out.http=r.status();await wait(700);
  await p.screenshot({path:'/sessions/inspiring-zen-lamport/mnt/outputs/apple_full_page.png',fullPage:true});
  out.shot='saved';await b.close();out.RESULT='PASS';
}catch(e){out.RESULT='FAIL';out.err=String(e).split('\n')[0].slice(0,80);}
finally{try{process.kill(-srv.pid,'SIGKILL');}catch{}}
writeFileSync('./.shot.json',JSON.stringify(out));process.exit(0);
