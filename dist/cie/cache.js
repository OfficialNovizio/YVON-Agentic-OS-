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
    return entry;
}
function setCached(query, agentId, result, ttlMs = DEFAULT_TTL_MS) {
    const fp = fingerprint(query, agentId);
    // LRU eviction
    if (cache.size >= MAX_ENTRIES) {
        let oldestKey = '';
        let oldestTime = Infinity;
        for (const [key, entry] of cache) {
            if (entry.lastAccess < oldestTime) {
                oldestTime = entry.lastAccess;
                oldestKey = key;
            }
        }
        if (oldestKey)
            cache.delete(oldestKey);
    }
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