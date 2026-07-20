// ═══════════════════════════════════════════════════════════════
// YVON Dashboard — Shared Types
// ═══════════════════════════════════════════════════════════════

export interface Brand {
  id: string;
  name: string;
  type: 'Owned Brand' | 'AgentX';
  tier?: 'Starter' | 'Growth' | 'Scale' | 'Enterprise';
  price?: string;
  health: number;
  departments: string;
  agents: number;
  connectors: string[];
  color: string;
  industry?: string;
}

export interface PipelineStats {
  tests: number;
  failures: number;
  avgSavings: string;
  harnessGates: number;
  avgConflicts: number;
}

export interface ActivityItem {
  ok: boolean;
  text: string;
  time: string;
  meta: string;
}

export interface ModuleTest {
  module: string;
  tests: number;
  status: 'ok' | 'fail';
  coverage?: string;
}

export interface DashboardData {
  brands: Brand[];
  pipeline: PipelineStats;
  activity: ActivityItem[];
  modules: ModuleTest[];
}

export interface BrandDetailData extends Brand {
  thisWeek: { postsReady: number; reviewsDone: number; nextDeadline: string };
  content: { instagram: number; stories: number; drafts: number };
  reach: { views: string; clicks: string; ctr: string; trend: 'up' | 'down' | 'stable' };
  calendar: CalendarItem[];
  recentActivity: ActivityItem[];
  pipelineHealth: { agentUptime: string; contentQuality: string; harnessStatus: string };
}

export interface CalendarItem {
  day: string;
  task: string;
  status: 'done' | 'pending' | 'draft';
}

export interface AddBrandForm {
  name: string;
  industry: string;
  departments: string[];
  tier: 'Starter' | 'Growth' | 'Scale';
}
