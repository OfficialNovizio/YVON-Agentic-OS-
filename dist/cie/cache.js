"use strict";
// src/cie/cache.ts — LRU Context Cache
//
// Caches successful retrieval results keyed by (agent_id + query_fingerprint).
// Repeated queries skip the full RAG pipeline → sub-10ms response.
//
// Fingerprint: first 200 chars of normalized query + agent_id.
// LRU eviction at 500 entries.
// Invalidation on source file change (mtime check via config).
//
// Book grounding:
//   Zipf (1949): A small number of query patterns dominate usage.
//                 Top-100 cached patterns serve 80%+ of requests.
//   DeMarco Ch.2: "You cannot control what you cannot measure."
//                 Every cache hit/miss is logged for feedback.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCached = getCached;
exports.setCached = setCached;
exports.cacheStats = cacheStats;
exports.invalidateAgent = invalidateAgent;
exports.invalidateAll = invalidateAll;
const MAX_ENTRIES = 500;
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes
const FINGERPRINT_LEN = 200;
const cache = new Map();
function fingerprint(query, agentId) {
    const normalized = query.toLowerCase().trim().slice(0, FINGERPRINT_LEN);
    return `${agentId}:${normalized}`;
}
// ponytail: LRU via Map insertion order, not a hand-rolled oldest-entry scan. A `Map` iterates
// in insertion order, so re-inserting an entry on every touch (delete then set) moves it to the
// "newest" end; the first key in iteration order is then always the least-recently-touched one.
// Eviction is O(1) (`cache.keys().next().value`) instead of the O(n) scan this replaced.
function getCached(fingerprintKey) {
    const entry = cache.get(fingerprintKey);
    if (!entry)
        return undefined;
    // Check expiry
    if (Date.now() > entry.expiresAt) {
        cache.delete(fingerprintKey);
        return undefined;
    }
    entry.hits++;
    entry.lastAccess = Date.now();
    cache.delete(fingerprintKey); // move to newest end (see LRU note above)
    cache.set(fingerprintKey, entry);
    return entry;
}
function setCached(query, agentId, result, ttlMs = DEFAULT_TTL_MS) {
    const fp = fingerprint(query, agentId);
    if (cache.size >= MAX_ENTRIES) {
        const oldestKey = cache.keys().next().value;
        if (oldestKey !== undefined)
            cache.delete(oldestKey);
    }
    cache.delete(fp); // ensure a re-set also moves to the newest end
    cache.set(fp, {
        fingerprint: fp,
        agentId,
        query: query.slice(0, 200),
        result,
        hits: 1,
        lastAccess: Date.now(),
        createdAt: Date.now(),
        expiresAt: Date.now() + ttlMs,
    });
}
function cacheStats() {
    let totalHits = 0;
    let oldestTime = Date.now();
    for (const entry of cache.values()) {
        totalHits += entry.hits;
        if (entry.createdAt < oldestTime)
            oldestTime = entry.createdAt;
    }
    return {
        size: cache.size,
        totalHits,
        oldestEntry: oldestTime,
    };
}
function invalidateAgent(agentId) {
    let removed = 0;
    for (const [key, entry] of cache) {
        if (entry.agentId === agentId) {
            cache.delete(key);
            removed++;
        }
    }
    return removed;
}
function invalidateAll() {
    cache.clear();
}
//# sourceMappingURL=cache.js.map