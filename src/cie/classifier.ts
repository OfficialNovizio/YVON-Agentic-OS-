// lib/cie/classifier.ts — Task classification via keyword pattern matching
//
// Zero tokens: pure regex matching on the message text.
// Agent bias nudges scores based on the 46-agent department framework.
// Task type now maps to departments, not narrow function categories.

import type { TaskType, TaskProfile } from './types';

// ---------------------------------------------------------------------------
// Pattern definitions — each TaskType maps to a department domain.
// ---------------------------------------------------------------------------

// Use RegExp constructor to avoid forward-slash issues with A/B in regex literals
const TYPE_PATTERNS: Record<TaskType, RegExp> = {
  engineering:  /\b(?:error|crash|build|route|API|database|schema|migration|deploy|component|layout|CSS|responsive|tailwind|backend|frontend|server|endpoint|query|import|refactor|performance|latency|memory)\b/i,
  strategy:     /\b(?:decide|direction|OKR|priority|investor|revenue|valuation|pitch|narrative|roadmap|funding|round|term sheet|cap table)\b/i,
  governance:   /\b(?:board|fiduciary|constitution|compliance|audit|ruling|precedent|veto|oversight|policy|charter|gate)\b/i,
  brand_marketing: /\b(?:campaign|copyright|brand|social|ad|content|copy|headline|story|voice|design|color|palette|layout|typography|SEO|growth|funnel|conversion|creative|asset|visual|prompt|video|UGC|cinematic)\b/i,
  cybersecurity: /\b(?:security|breach|vulnerability|CVE|threat|attack|exploit|firewall|auth|token|secret|encryption|privacy|GDPR|CCPA|DLP|phishing|ransomware|incident|forensic|patch)\b/i,
  product_analytics: new RegExp('\\b(?:experiment|A\\/B|metric|retention|churn|funnel|cohort|conversion|user research|survey|SUS|usability|sample|significance|power|MDE|PMF|pricing|WTP|elasticity)\\b', 'i'),
  ai_agents:    /\b(?:agent|model|LLM|prompt|prototype|skill|fleet|automation|orchestration|benchmark|evaluation|adoption|gateway)\b/i,
  general:      /(?:)/i,
};

const EXTRACT_PATTERNS: Record<TaskType, RegExp> = {
  engineering:  /\b(?:error|crash|build|route|API|database|schema|migration|deploy|component|layout|CSS|responsive|tailwind|backend|frontend|server|endpoint|query|import|refactor|performance|latency|memory)\b/gi,
  strategy:     /\b(?:decide|direction|OKR|priority|investor|revenue|valuation|pitch|narrative|roadmap|funding|round|term|cap)\b/gi,
  governance:   /\b(?:board|fiduciary|constitution|compliance|audit|ruling|precedent|veto|oversight|policy|charter|gate)\b/gi,
  brand_marketing: /\b(?:campaign|copyright|brand|social|ad|content|copy|headline|story|voice|design|color|palette|layout|typography|SEO|growth|funnel|conversion|creative|asset|visual|prompt|video|UGC|cinematic)\b/gi,
  cybersecurity: /\b(?:security|breach|vulnerability|CVE|threat|attack|exploit|firewall|auth|token|secret|encryption|privacy|GDPR|CCPA|DLP|phishing|ransomware|incident|forensic|patch)\b/gi,
  product_analytics: new RegExp('\\b(?:experiment|A\\/B|metric|retention|churn|funnel|cohort|conversion|research|survey|SUS|usability|sample|significance|power|MDE|PMF|pricing|WTP|elasticity)\\b', 'gi'),
  ai_agents:    /\b(?:agent|model|LLM|prompt|prototype|skill|fleet|automation|orchestration|benchmark|evaluation|adoption|gateway)\b/gi,
  general:      /(?:)/gi,
};

// ---------------------------------------------------------------------------
// Agent-to-department routing — maps any of 46 agents to their department.
// Used to bias classification toward the agent's home domain.
// ---------------------------------------------------------------------------

const AGENT_DEPARTMENT: Record<string, string> = {
  // Executive Office
  marcus:'Executive Office', echo:'Executive Office', vista:'Executive Office',
  // Governance
  board:'Governance', precedent:'Governance', sentinel:'Governance',
  // Engineering
  dev:'Engineering', ops:'Engineering', cypher:'Engineering', aegis:'Engineering',
  axiom:'Engineering', rank:'Engineering', quinn:'Engineering', dana:'Engineering',
  raj:'Engineering', mia:'Engineering', nova:'Engineering',
  // Cybersecurity
  warden:'Cybersecurity', keyring:'Cybersecurity', bastion:'Cybersecurity',
  cortex:'Cybersecurity', veil:'Cybersecurity',
  // Product
  spec:'Product', metric:'Product', ux:'Product', loom:'Product', price:'Product',
  // AI & Agents
  meta:'AI & Agents', relay:'AI & Agents', gauge:'AI & Agents', anneal:'AI & Agents',
  forge:'AI & Agents', scout:'AI & Agents', proto:'AI & Agents', edge:'AI & Agents',
  // Brand Studio
  spark:'Brand Studio', atlas:'Brand Studio', lena:'Brand Studio', weave:'Brand Studio',
  muse:'Brand Studio', pixel:'Brand Studio', pulse:'Brand Studio', rio:'Brand Studio',
  nate:'Brand Studio', kai:'Brand Studio', tempo:'Brand Studio',
};

// Department → TaskType mapping
const DEPT_TASK_TYPE: Record<string, TaskType> = {
  'Executive Office':   'strategy',
  'Governance':         'governance',
  'Engineering':        'engineering',
  'Cybersecurity':      'cybersecurity',
  'Product':            'product_analytics',
  'AI & Agents':        'ai_agents',
  'Brand Studio':       'brand_marketing',
};

// Priority order for tie-breaking
const PRIORITY_ORDER: TaskType[] = [
  'engineering', 'strategy', 'governance', 'brand_marketing',
  'cybersecurity', 'product_analytics', 'ai_agents', 'general',
];

// ---------------------------------------------------------------------------
// agentBias — returns boost for an agent's home department task type.
// ---------------------------------------------------------------------------

export function agentBias(agentId: string, taskType: TaskType): number {
  const dept = AGENT_DEPARTMENT[agentId.toLowerCase()];
  if (!dept) return 0;
  const homeType = DEPT_TASK_TYPE[dept];
  return (homeType === taskType) ? 2 : 0;
}

// ---------------------------------------------------------------------------
// extractKeywords — pull all matched keywords out of the message.
// ---------------------------------------------------------------------------

function extractKeywords(message: string, taskType: TaskType): string[] {
  const pattern = EXTRACT_PATTERNS[taskType];
  const matches = message.match(pattern);
  if (!matches || matches.length === 0) return [];
  return [...new Set(matches.map((m) => m.toLowerCase()))];
}

// ---------------------------------------------------------------------------
// classifyTask — main entry point.
//
// 1. Score every TaskType by counting regex matches.
// 2. Apply agent department bias (+2 for agent's home domain).
// 3. Pick the type with the highest score (general if all zero).
// 4. Compute confidence: winning score / sum of all scores.
// 5. Extract and return keywords from the winning type.
//
// Agent IDs come from the 46-agent registry in src/agents/personalities.ts
// ---------------------------------------------------------------------------

export function classifyTask(
  agentId: string,
  message: string,
  venture: string,
): TaskProfile {
  const scores: Record<TaskType, number> = {
    engineering: 0,
    strategy: 0,
    governance: 0,
    brand_marketing: 0,
    cybersecurity: 0,
    product_analytics: 0,
    ai_agents: 0,
    general: 0,
  };

  // Step 1 — count keyword matches.
  for (const taskType of PRIORITY_ORDER) {
    if (taskType === 'general') continue;
    const matches = message.match(TYPE_PATTERNS[taskType]);
    scores[taskType] = matches ? matches.length : 0;
  }

  // Step 2 — apply agent department bias.
  for (const taskType of PRIORITY_ORDER) {
    if (taskType === 'general') continue;
    scores[taskType] += agentBias(agentId, taskType);
  }

  // Step 3 — determine winning type.
  let bestType: TaskType = 'general';
  let bestScore = -1;

  for (const taskType of PRIORITY_ORDER) {
    if (scores[taskType] > bestScore) {
      bestScore = scores[taskType];
      bestType = taskType;
    }
  }

  if (bestScore <= 0) {
    bestType = 'general';
    bestScore = 1;
    scores.general = 1;
  }

  // Step 4 — compute confidence.
  const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0);
  const confidence = totalScore > 0
    ? Math.round((bestScore / totalScore) * 100) / 100
    : 1;

  // Step 5 — extract keywords.
  const keywords = extractKeywords(message, bestType);

  return {
    type: bestType,
    agentId,
    venture,
    confidence,
    keywords,
  };
}
