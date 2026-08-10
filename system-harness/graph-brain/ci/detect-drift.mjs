#!/usr/bin/env node
/**
 * detect-drift.mjs — system-harness/graph-brain/YVON-GRAPH.md §3 Q7 / §6.1, as a runnable CI check.
 *
 * The two id contracts (§6.1):
 *   agent_id   = slug(department) + '-' + directory_name   (build-structure.mjs)
 *   context_id = ventures.context_path
 *
 * A drifted agent_id is invisible in the browser — the node that should light up simply never
 * does, with no error anywhere. Q7 is the only thing that catches it before an operator notices
 * by staring at a dark node. This script is Q7's SQL translated into a live check:
 *
 *   SELECT DISTINCT actor FROM events
 *   WHERE ts > now() - interval '30 days' AND actor <> 'system'
 *
 * ...diffed against the live agent id set from dashboard/public/structure.json. Any actor that
 * isn't in structure.json is a node that will never light — exit 1 so CI fails loudly instead of
 * the drift sitting silent in production.
 *
 * Requires (as CI secrets / env): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY. Uses fetch() directly
 * against PostgREST rather than pulling in @supabase/supabase-js — this script has no other
 * dependencies and needs none.
 *
 * Run: node system-harness/graph-brain/ci/detect-drift.mjs   (from repo root)
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..', '..');
const STRUCTURE_PATH = join(REPO_ROOT, 'dashboard', 'public', 'structure.json');

function loadStructureIds() {
  if (!existsSync(STRUCTURE_PATH)) {
    console.error(`✗ ${STRUCTURE_PATH} not found — run "node scripts/build-structure.mjs" first.`);
    process.exit(2);
  }
  const s = JSON.parse(readFileSync(STRUCTURE_PATH, 'utf-8'));
  const ids = new Set();
  for (const dept of s.departments ?? []) {
    for (const agent of dept.agents ?? []) ids.add(agent.id);
  }
  return ids;
}

async function fetchRecentActors(url, key) {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const q = new URLSearchParams({
    select: 'actor',
    ts: `gt.${since}`,
    actor: 'neq.system',
  });
  const res = await fetch(`${url}/rest/v1/events?${q.toString()}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) {
    throw new Error(`events query failed: ${res.status} ${await res.text()}`);
  }
  const rows = await res.json();
  return new Set(rows.map((r) => r.actor).filter(Boolean));
}

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.log('ⓘ SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — skipping (local dev with no Supabase env is expected to skip, per doc §6.7 failure mode #7).');
    process.exit(0);
  }

  const structureIds = loadStructureIds();
  console.log(`Loaded ${structureIds.size} agent ids from structure.json.`);

  let actors;
  try {
    actors = await fetchRecentActors(url, key);
  } catch (err) {
    console.error(`✗ Could not reach Supabase: ${err.message}`);
    process.exit(2);
  }
  console.log(`Found ${actors.size} distinct actors in events over the last 30 days.`);

  const drifted = [...actors].filter((a) => !structureIds.has(a)).sort();

  if (drifted.length === 0) {
    console.log('✓ No drift — every recent actor matches a live structure.json id.');
    process.exit(0);
  }

  console.error(`✗ Drift detected — ${drifted.length} actor(s) in events do not match any structure.json agent id:`);
  for (const a of drifted) console.error(`  - ${a}`);
  console.error('\nThese nodes will never light on /brain. Likely causes: an agent directory was');
  console.error('renamed/removed after Hermes emitted events under the old id, or agent-alias.json');
  console.error('on the VPS is stale (doc §6.1, §4.4). Regenerate the alias map and confirm the');
  console.error('actor name matches the current structure.json id.');
  process.exit(1);
}

main();
