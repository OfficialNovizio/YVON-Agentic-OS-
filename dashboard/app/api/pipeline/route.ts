import { NextRequest, NextResponse } from 'next/server';

// Pipeline API — calls Python RAG bridge
// GET /api/pipeline?mode=master — master dashboard data
// GET /api/pipeline?mode=brand&id=xxx — brand detail
// POST /api/pipeline?mode=provision — provision new brand

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('mode') || 'master';
  const brandId = searchParams.get('id');

  // In production: spawn bridge.py subprocess
  // For now: return mock matching production structure

  if (mode === 'brand' && brandId) {
    return NextResponse.json(getMockBrand(brandId));
  }

  if (mode === 'tests') {
    return NextResponse.json(getMockTests());
  }

  return NextResponse.json(getMockMaster());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, industry, departments, tier } = body;

  return NextResponse.json({
    success: true,
    brandId: name.toLowerCase().replace(/\s+/g, '-'),
    steps: [
      { step: 'Create tenant graph vault', status: 'done' },
      { step: 'Copy agent definitions', status: 'done' },
      { step: 'Apply industry overrides', status: 'pending' },
      { step: 'Wire connectors', status: 'pending' },
      { step: 'Run smoke test', status: 'pending' },
    ],
  });
}

function getMockMaster() {
  return {
    brands: [
      { id:'novizio',name:'Novizio',type:'Owned Brand',health:82,departments:'3 departments',agents:11,connectors:['Instagram','Shopify'],color:'#F59E0B' },
      { id:'hourbour',name:'Hourbour',type:'Owned Brand',health:93,departments:'2 departments',agents:8,connectors:['Instagram'],color:'#0F766E' },
      { id:'boutique-a',name:'Boutique A',type:'AgentX',tier:'Growth',price:'$149/mo',health:78,departments:'Brand Studio · Product',agents:8,connectors:['Instagram','Shopify'],color:'#8B5CF6',industry:'Fashion Retail' },
      { id:'cafe-b',name:'Café B',type:'AgentX',tier:'Starter',price:'$49/mo',health:85,departments:'Brand Studio',agents:3,connectors:['Instagram'],color:'#EC4899',industry:'Food & Beverage' },
    ],
    pipeline: { tests:285,failures:0,avgSavings:'73%',harnessGates:5,avgConflicts:1.2 },
    activity: [
      { ok:true,text:'Pipeline ran 5 live queries — all domains passing',time:'06:30',meta:'spark · marcus · comply · board · dev' },
      { ok:true,text:'4,839 chunks rebuilt with quality scores (v2)',time:'04:20',meta:'chunkify · dev' },
      { ok:true,text:'3 RAG bugs fixed',time:'03:15',meta:'dev · quinn · harness' },
      { ok:false,text:'Financial analysis — 17 same-dept conflicts',time:'02:00',meta:'marcus · gate_conflicts' },
    ],
    modules: getMockTests(),
  };
}

function getMockTests() {
  return [
    { module:'core/injector',tests:22,status:'ok' },{ module:'core/strategy',tests:23,status:'ok' },
    { module:'core/destructor',tests:35,status:'ok' },{ module:'core/optimizer',tests:24,status:'ok' },
    { module:'core/retriever',tests:20,status:'ok' },{ module:'core/bridge',tests:16,status:'ok' },
    { module:'harness/gates',tests:35,status:'ok' },{ module:'harness/disclosure',tests:23,status:'ok' },
    { module:'verify/grounded',tests:16,status:'ok' },{ module:'monitor/watcher',tests:17,status:'ok' },
    { module:'monitor/improver',tests:20,status:'ok' },{ module:'eval/judge',tests:10,status:'ok' },
    { module:'eval/flywheel',tests:12,status:'ok' },
  ];
}

function getMockBrand(id: string) {
  return {
    id,name:'Boutique A',type:'AgentX',tier:'Growth',price:'$149/mo',health:78,
    departments:'Brand Studio · Product',agents:8,connectors:['Instagram','Shopify'],
    color:'#8B5CF6',industry:'Fashion Retail',
    thisWeek:{ postsReady:5,reviewsDone:2,nextDeadline:'Thursday' },
    content:{ instagram:3,stories:2,drafts:4 },
    reach:{ views:'1.2K',clicks:'84',ctr:'3.2%',trend:'up' },
    calendar:[
      { day:'MON',task:'New arrivals Instagram post',status:'done' },
      { day:'TUE',task:'Behind-the-scenes Story',status:'done' },
      { day:'WED',task:'Customer spotlight carousel',status:'pending' },
      { day:'THU',task:'Sale announcement + link',status:'draft' },
      { day:'FRI',task:'Weekend style inspiration',status:'draft' },
    ],
  };
}
