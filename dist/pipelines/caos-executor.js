"use strict";
// src/pipelines/caos-executor.ts — CAOS Pipeline Executor
//
// Traverses the execution graph, builds per-agent prompts, calls LLMs with
// RAG context + computed facts, enforces gates, routes outputs downstream,
// and logs everything in Lasswell-compliant format.
//
// This is THE orchestrator that turns the graph plan into actual agent calls.
//
// Flow per execution:
//   graph → iterate stages → for each: build prompt → RAG context → LLM → check gate → next
//
// Scaling properties:
//   - 100 agents: metadata filter absorbs growth (same latency)
//   - Multi-tenant: tenant_id in SQL WHERE clause isolates data
//   - Graph auto-rebuilds: reads DEPARTMENT-WORKFLOW.md at runtime
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeCaosPipeline = executeCaosPipeline;
const fs_1 = require("fs");
const path_1 = require("path");
const graph_resolver_1 = require("../cie/graph-resolver");
const rag_bridge_1 = require("../cie/rag-bridge");
const cache_1 = require("../cie/cache");
const config_1 = require("../adapters/config");
const personalities_1 = require("../agents/personalities");
const archetype_1 = require("../cie/archetype");
const generation_trio_1 = require("../cie/generation-trio");
// ─── Agent prompt builder ───────────────────────────────────────────
function buildAgentPrompt(agentId, task) {
    const profile = (0, personalities_1.getAgentProfile)(agentId);
    if (!profile)
        return task;
    // Read identity file for leaders
    let identityBlock = '';
    if (profile.isLeader && profile.identityPath) {
        const config = (0, config_1.getConfig)();
        const identityFile = (0, path_1.join)(config.teamsPath || '', profile.identityPath);
        // Find the .md file in identity folder
        try {
            if ((0, fs_1.existsSync)(identityFile)) {
                const files = require('fs').readdirSync(identityFile);
                const mdFile = files.find((f) => f.endsWith('.md'));
                if (mdFile) {
                    const content = (0, fs_1.readFileSync)((0, path_1.join)(identityFile, mdFile), 'utf-8');
                    // Extract the personality baseline section
                    const match = content.match(/##\s*(?:Personality Baseline|Default Behaviors|Identity)[\s\S]*?(?=##|$)/i);
                    if (match)
                        identityBlock = match[0].slice(0, 500);
                }
            }
        }
        catch { }
    }
    // Read principles file
    let principlesBlock = '';
    try {
        const config = (0, config_1.getConfig)();
        const princPath = (0, path_1.join)(config.teamsPath || '', profile.principlesPath);
        if ((0, fs_1.existsSync)(princPath)) {
            const content = (0, fs_1.readFileSync)(princPath, 'utf-8');
            principlesBlock = content.slice(0, 800);
        }
    }
    catch { }
    let prompt = `[AGENT: ${profile.name} — ${profile.role} (${profile.department})]\n\n`;
    if (identityBlock) {
        prompt += `[IDENTITY]\n${identityBlock}\n\n`;
    }
    if (principlesBlock) {
        prompt += `[CROSS-SKILL PRINCIPLES]\n${principlesBlock}\n\n`;
    }
    prompt += `[TASK]\n${task}\n`;
    prompt += `\n[CITATION RULE] Every recommendation must cite its source: book, chapter, page.\n`;
    return prompt;
}
// ─── Main executor ──────────────────────────────────────────────────
async function executeCaosPipeline(task, agentId, venture = 'default', retrievalMode = 'auto', skipCache = false) {
    const t0 = Date.now();
    const calls = [];
    const results = [];
    let cacheHits = 0;
    let feedbackLogged = false;
    // ── Step 1: Resolve department ──────────────────────────────────
    const profile = (0, personalities_1.getAgentProfile)(agentId);
    const dept = profile?.department || 'Executive Office';
    // ── Step 2: Build execution graph ───────────────────────────────
    const plan = (0, graph_resolver_1.resolveExecutionGraph)(dept, task, agentId);
    // Determine retrieval mode
    const mode = retrievalMode === 'auto'
        ? (plan.stages.length > 3 ? 'agentic' : 'standard')
        : retrievalMode;
    // ── Step 3: Execute each stage ──────────────────────────────────
    const upstreamOutputs = [];
    let gateBlocked = false;
    let blockerReason = '';
    for (const stage of plan.stages) {
        // Wait for dependencies (in real async: Promise.all upstream stages)
        // For now: stages are sequential per department workflow
        // ── Build RAG context for this agent ─────────────────────────
        let ragContext = '';
        let ragResult = null;
        let stageChunksInjected = 0;
        let stageFormulasComputed = 0;
        // Check cache first
        if (!skipCache) {
            const fp = `${stage.agentId}:${task.toLowerCase().trim().slice(0, 200)}`;
            const cached = (0, cache_1.getCached)(fp);
            if (cached) {
                ragContext = cached.result.injection_text;
                cacheHits++;
                stageChunksInjected = cached.result.chunks ?? 1;
            }
        }
        // Missed cache → call RAG Bridge
        if (!ragContext) {
            try {
                ragResult = await (0, rag_bridge_1.callRagBridge)({
                    query: task,
                    agentId: stage.agentId,
                    dept: stage.agentDept,
                    retrievalMode: mode,
                });
                if (ragResult.success) {
                    ragContext = ragResult.injection_text || '';
                    stageChunksInjected = ragResult.chunks ?? 0;
                    stageFormulasComputed = ragResult.computed_formulas?.filter(f => f.computed).length ?? 0;
                }
            }
            catch {
                // RAG bridge unavailable — agent proceeds without RAG context
            }
        }
        // ── Build prompt ─────────────────────────────────────────────
        const systemPrompt = buildAgentPrompt(stage.agentId, task);
        // Compose upstream context
        let upstreamBlock = '';
        if (upstreamOutputs.length > 0) {
            upstreamBlock = `[UPSTREAM OUTPUTS — from ${stage.dependencies.join(', ')}]\n`;
            upstreamBlock += upstreamOutputs.map((o, i) => `[${stage.dependencies[i] || 'prev'}]: ${o.slice(0, 300)}`).join('\n\n');
        }
        // ── Compose final prompt ─────────────────────────────────────
        const call = {
            agentId: stage.agentId,
            stage,
            systemPrompt,
            ragContext: ragContext || '[No RAG context available]',
            upstreamOutputs: upstreamOutputs.length ? upstreamOutputs : [],
            computedFacts: '',
        };
        calls.push(call);
        // ── ♢♢♢ LLM CALL — §6.3 Layer 7.1, generation-trio.ts (built 2026-08-09) ─
        // Archetype-gated: PRECISION_CRITICAL/ADVERSARIAL_TESTING run the full
        // primary+adversarial+creative trio; everything else is primary-only.
        const stageStart = Date.now();
        const classified = (0, archetype_1.classifyArchetype)(task, stage.agentDept);
        const trioResult = await (0, generation_trio_1.runGenerationTrio)(classified.archetype, {
            systemPrompt,
            task,
            ragContext: ragContext || undefined,
        });
        const llmOutput = trioResult.primary.available
            ? trioResult.primary.content ?? ''
            // No ANTHROPIC_API_KEY (or a call failure) — degrade loudly rather than
            // fabricate a response, same pattern this repo uses everywhere else
            // (kai's C4, tool-context's materialize check, etc.).
            : `[${stage.agentId}: generation unavailable — ${trioResult.primary.reason}]`;
        const stageMs = Date.now() - stageStart;
        // ── Check gate ──────────────────────────────────────────────
        let gateResult;
        if (stage.isGate) {
            gateResult = (0, graph_resolver_1.evaluateGate)(stage, llmOutput);
            if (!gateResult.passed) {
                gateBlocked = true;
                blockerReason = gateResult.blockingReason || 'Gate blocked';
                results.push({
                    agentId: stage.agentId,
                    output: llmOutput,
                    gateResult,
                    timingMs: stageMs,
                    chunksInjected: stageChunksInjected,
                    computedFormulas: stageFormulasComputed,
                });
                // Cache successful retrieval
                if (ragContext && !skipCache) {
                    (0, cache_1.setCached)(task, stage.agentId, {
                        injection_text: ragContext,
                        trace: ragResult?.trace || {},
                        profile: ragResult?.profile,
                        chunks: stageChunksInjected,
                    });
                }
                // STOP — gates block downstream execution
                break;
            }
        }
        // Pass output to downstream stages
        upstreamOutputs.push(llmOutput);
        results.push({
            agentId: stage.agentId,
            output: llmOutput,
            gateResult,
            timingMs: stageMs,
            chunksInjected: stageChunksInjected,
            computedFormulas: stageFormulasComputed,
        });
    }
    // ── Step 4: Log feedback ──────────────────────────────────────
    const finalOutput = results.length > 0
        ? results[results.length - 1].output
        : '';
    const lastResult = results[results.length - 1];
    if (lastResult?.gateResult) {
        try {
            await (0, rag_bridge_1.callRagFeedback)({
                trace: {
                    who: agentId,
                    what: calls.map(c => ({
                        chunk_id: c.stage.agentId,
                        source: c.stage.description || '',
                        section: c.stage.agentDept || '',
                        tier: c.stage.isGate ? 1 : 2,
                        adversary: false,
                        chars: c.ragContext.length,
                    })),
                    channel: 'CAOS pipeline',
                    whom: 'claude',
                    effect: gateBlocked ? 'rejected' : 'accepted',
                    strategy: mode,
                    profile: plan.stages[0]?.agentDept || '',
                },
                outcome: gateBlocked ? 'rejected' : 'accepted',
            });
            feedbackLogged = true;
        }
        catch {
            // Non-blocking
        }
    }
    const totalMs = Date.now() - t0;
    return {
        plan,
        calls,
        results,
        finalOutput,
        gateBlocked,
        blockerReason,
        totalTimingMs: totalMs,
        trace: {
            graph: plan.stages.map(s => s.agentId).join(' → '),
            retrievalMode: mode,
            cacheHits,
            feedbackLogged,
            citationsPresent: calls.some(c => c.ragContext.includes('[') && c.ragContext.includes(']')),
        },
    };
}
//# sourceMappingURL=caos-executor.js.map