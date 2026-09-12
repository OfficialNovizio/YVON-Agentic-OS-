const fs=require('fs'),path=require('path');
const dir='store/design-sessions';
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.json')&&!f.startsWith('._'));
console.log('\n=== VERIFY 3: design sessions on disk ===');
console.log('  session files:', files.length);
for(const f of files.slice(0,6)){
  try{
    const j=JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));
    const hasIntent = !!(j.intent && j.intent.mode);
    console.log('  '+f.slice(0,10)+'  status='+String(j.status).padEnd(10)+' intent='+(hasIntent?j.intent.mode:'(none)')+'  ref='+String(j.reference&&j.reference.url||'-').slice(0,34));
  }catch(e){ console.log('  '+f.slice(0,10)+'  parse error'); }
}
