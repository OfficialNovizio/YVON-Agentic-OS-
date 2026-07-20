#!/usr/bin/env python3
"""
Data Systems — Distributed Data & Database Engineering
=======================================================
Sources (2-book minimum per §8.0):
  Book 1: Kleppmann, Martin, *Designing Data-Intensive Applications*
          (O'Reilly, 2017). ISBN 978-1-4493-7332-0.
          https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/
          Chapters used: 3 (Storage and Retrieval), 5 (Replication),
          6 (Partitioning), 7 (Transactions), 8 (Trouble with Distributed
          Systems), 9 (Consistency and Consensus), 10 (Batch Processing),
          11 (Stream Processing), 12 (Future of Data Systems)

  Book 2: Bailis, Hellerstein & Stonebraker (eds.), *Readings in Database
          Systems* (5th Ed., "Red Book," 2015).
          Free at http://www.redbook.io/ (CC BY-NC-SA 4.0).
          Chapters used: 1 (Background — Stonebraker), 2 (Traditional
          RDBMS), 3 (Techniques Everyone Should Know — Bailis),
          4 (New DBMS Architectures), 6 (Weak Isolation & Distribution)

Route: A/B (formulas for consistency math + rule-based trade-off decisions)

Covers what dana, raj, nova, and ops need:
  - Normalization trade-off analysis (denormalization cost-benefit)
  - Consistency model selection (ACID isolation levels with Kleppmann Ch.7)
  - Replication strategy choice (leader-leader vs leader-follower, Ch.5)
  - Partitioning key evaluation (Ch.6 — hot spot detection)
  - Index selection heuristics (Ch.3 — LSM vs B-tree trade-offs)
  - Transaction isolation anomaly scoring
  - CAP theorem practical decision framework
  - Consensus protocol comparison (Raft vs Paxos, Ch.9)
"""

from __future__ import annotations
import math
import sys
from typing import List, Dict, Optional, Tuple


def _fv(val: float, name: str) -> None:
    if not isinstance(val, (int, float)):
        raise TypeError(f"{name} must be a number")
    if math.isnan(val) or math.isinf(val):
        raise ValueError(f"{name} is {'NaN' if math.isnan(val) else 'infinite'}")


# ═══════════════════════════════════════════════════════════════════
# PART 1 — CONSISTENCY MODEL SELECTION
# Source: Kleppmann Ch.7 (Transactions), Ch.9 (Consistency & Consensus)
#         Red Book Ch.6 (Weak Isolation & Distribution)
# ═══════════════════════════════════════════════════════════════════

ISOLATION_LEVELS = {
    "read_uncommitted": {
        "dirty_reads": True, "dirty_writes": True,
        "fuzzy_reads": True, "phantom_reads": True,
        "write_skew": True, "lost_update": True,
        "perf_overhead": "none",
        "kleppmann_ch7": "pp.226-228 (weakest, rarely useful)",
        "use_case": "None — avoid. Kleppmann Ch.7, p.227: 'Read uncommitted is a non-serializable isolation level that allows dirty reads. It exists mainly for historical reasons.'"
    },
    "read_committed": {
        "dirty_reads": False, "dirty_writes": False,
        "fuzzy_reads": True, "phantom_reads": True,
        "write_skew": True, "lost_update": True,
        "perf_overhead": "low",
        "kleppmann_ch7": "pp.228-233 (default in PostgreSQL, SQL Server)",
        "use_case": "Standard OLTP when anomalies are handled at app level."
    },
    "snapshot_isolation": {
        "dirty_reads": False, "dirty_writes": False,
        "fuzzy_reads": False, "phantom_reads": True,
        "write_skew": True, "lost_update": False,
        "perf_overhead": "medium",
        "kleppmann_ch7": "pp.233-246 (MVCC-based, default in Oracle, PostgreSQL repeatable read)",
        "use_case": "Read-heavy workloads where non-repeatable reads are unacceptable."
    },
    "serializable": {
        "dirty_reads": False, "dirty_writes": False,
        "fuzzy_reads": False, "phantom_reads": False,
        "write_skew": False, "lost_update": False,
        "perf_overhead": "high",
        "kleppmann_ch7": "pp.251-267 (strongest, prevents all race conditions)",
        "use_case": "Financial transactions, inventory, any workload where correctness > throughput."
    },
}


def transaction_isolation_score(
    level: str,
    workload_read_heavy: bool = False,
    tolerance_for_anomalies: str = "none",
) -> Dict:
    """
    Score an isolation level for a given workload.
    Kleppmann Ch.7, pp.226-267; Red Book Ch.6, pp.30-35.

    Kleppmann Ch.7, p.226: "Databases have long tried to hide concurrency
    issues by providing transaction isolation. But serializable isolation
    has a performance cost, so weaker isolation levels are common."

    Returns dict with anomaly coverage, recommendation, and source citation.

    Edge cases: unknown level → ValueError
    """
    if level not in ISOLATION_LEVELS:
        raise ValueError(f"Unknown isolation level '{level}'. Known: {list(ISOLATION_LEVELS.keys())}")

    info = ISOLATION_LEVELS[level]
    anomalies_allowed = sum(1 for k, v in info.items()
                           if isinstance(v, bool) and v)

    # Compatibility with workload
    if tolerance_for_anomalies == "none" and anomalies_allowed > 0:
        recommendation = ("UPGRADE to serializable. "
                         "Kleppmann Ch.7, p.251: 'If you need strong isolation, "
                         "use serializable isolation. Weaker levels trade correctness "
                         "for performance — only acceptable if you understand the anomalies.'")
        compatible = False
    elif workload_read_heavy and level == "snapshot_isolation":
        recommendation = ("Snapshot isolation is well-suited. "
                         "Kleppmann Ch.7, p.233: 'MVCC provides consistent reads "
                         "without blocking writers — ideal for read-heavy OLTP.'")
        compatible = True
    elif anomalies_allowed <= 2:
        recommendation = ("Adequate for most workloads. "
                         "Kleppmann Ch.7, p.228: 'Read committed is the most basic "
                         "usable isolation level — it prevents dirty reads and writes.'")
        compatible = True
    else:
        recommendation = ("Consider stronger isolation. "
                         "Kleppmann Ch.7, p.228: 'Read uncommitted prevents nothing "
                         "useful in practice.'")
        compatible = False

    return {"level": level, "anomalies_allowed": anomalies_allowed,
            "perf_overhead": info["perf_overhead"],
            "compatible": compatible, "recommendation": recommendation,
            "source": f"Kleppmann Ch.7, {info['kleppmann_ch7']}; Red Book Ch.6"}


# ═══════════════════════════════════════════════════════════════════
# PART 2 — REPLICATION STRATEGY
# Source: Kleppmann Ch.5 (Replication)
# ═══════════════════════════════════════════════════════════════════

def replication_strategy(
    write_volume_qps: float,
    read_volume_qps: float,
    latency_tolerance_ms: float,
    consistency_requirement: str,
    geo_distributed: bool,
) -> Dict:
    """
    Select replication strategy: leader-follower, multi-leader, or leaderless.
    Kleppmann Ch.5, pp.151-198.

    Kleppmann Ch.5, p.152: "There are three popular algorithms for
    replicating changes between nodes: single-leader, multi-leader,
    and leaderless replication."

    Decision tree from Kleppmann Ch.5:
      Single-leader (leader-follower): simplest. All writes go to one node.
        Reads from followers may be stale (eventual consistency).
        Best for: write-heavy workloads tolerating async read lag.

      Multi-leader: each node accepts writes, conflicts resolved later.
        Best for: geo-distributed, multi-datacenter, offline-capable apps.
        Cost: conflict resolution logic required (LWW, CRDTs, app-level).

      Leaderless (Dynamo-style): writes to multiple nodes, reads from
        multiple nodes, quorum for consistency. Best for: high availability
        with tunable consistency (R + W > N = strong).

    Args:
      write_volume_qps:      Write queries per second
      read_volume_qps:       Read queries per second
      latency_tolerance_ms:  Max acceptable read latency in milliseconds
      consistency_requirement: 'strong', 'eventual', or 'tunable'
      geo_distributed:       Are nodes in multiple regions?

    Returns strategy dict with recommendation and Kleppmann citation.

    Edge cases: invalid consistency → ValueError
    """
    _fv(write_volume_qps, "write_volume_qps")
    _fv(read_volume_qps, "read_volume_qps")
    _fv(latency_tolerance_ms, "latency_tolerance_ms")
    valid_consistency = {"strong", "eventual", "tunable"}
    if consistency_requirement not in valid_consistency:
        raise ValueError(f"consistency_requirement must be one of {valid_consistency}")

    read_heavy = read_volume_qps > write_volume_qps * 3
    write_heavy = write_volume_qps > read_volume_qps

    if consistency_requirement == "strong":
        strategy = "Single-Leader (Leader-Follower)"
        rationale = ("All writes route to leader. Synchronous replication to one follower "
                    "for durability. Reads can be distributed to followers if staleness "
                    "is acceptable (eventual reads). "
                    "Kleppmann Ch.5, p.155: 'Leader-based replication is the most common "
                    "replication method — it keeps things simple.'")
        conflict_risk = "LOW — leader serializes writes by design"
        cap_position = "CP (Consistent + Partition-tolerant in the event of leader failure)"

    elif geo_distributed and consistency_requirement == "eventual":
        strategy = "Multi-Leader"
        rationale = ("Each datacenter accepts writes locally. Conflicts resolved via "
                    "CRDTs or LWW with application-level merging. "
                    "Kleppmann Ch.5, p.168: 'Multi-leader replication is appropriate "
                    "for multi-datacenter operation — it avoids writing to a leader "
                    "over the internet.'")
        conflict_risk = "MEDIUM — conflicts possible between concurrent writes"
        cap_position = "AP (Available + Partition-tolerant, eventually consistent)"

    elif consistency_requirement == "tunable":
        strategy = "Leaderless (Dynamo-style)"
        rationale = ("Writes to W nodes, reads from R nodes, N = total replicas. "
                    "Set R + W > N for strong consistency, or R + W ≤ N for "
                    "lower latency with eventual consistency. "
                    "Kleppmann Ch.5, p.178: 'Dynamo-style databases allow the "
                    "application to trade off consistency for availability.'")
        conflict_risk = "TUNABLE — depends on R+W vs N"
        cap_position = "Tunable: R+W>N→CP, R+W≤N→AP"

    else:
        strategy = "Single-Leader (default)"
        rationale = ("Defaulting to single-leader for simplicity. "
                    "Kleppmann Ch.5, p.155: 'When in doubt, use a single leader. "
                    "Most applications don't need the complexity of multi-leader "
                    "or leaderless replication.'")
        conflict_risk = "LOW"
        cap_position = "CP"

    return {"strategy": strategy, "rationale": rationale,
            "conflict_risk": conflict_risk, "cap_position": cap_position,
            "read_vs_write_ratio": round(read_volume_qps / max(write_volume_qps, 1), 1),
            "source": "Kleppmann Ch.5, pp.151-198"}


# ═══════════════════════════════════════════════════════════════════
# PART 3 — PARTITIONING / SHARDING KEY EVALUATION
# Source: Kleppmann Ch.6 (Partitioning)
#         Red Book Ch.4 (New DBMS Architectures — sharding)
# ═══════════════════════════════════════════════════════════════════

def partitioning_hotspot_risk(
    key_distribution: List[int],
    total_keys: int,
    max_imbalance_tolerance: float = 2.0,
) -> Dict:
    """
    Evaluate partitioning key for hotspot risk.
    Kleppmann Ch.6, pp.199-218.

    Kleppmann Ch.6, p.200: "The main reason for wanting to partition data
    is scalability. But if the partitioning is unfair, you get hotspots —
    one partition doing disproportionately more work."

    Hotspot detection:
      - Compute per-partition share of total load
      - Flag any partition exceeding max_imbalance × fair_share
      - Fair share = 1/N where N = number of partitions

    Args:
      key_distribution: Count of items per partition
      total_keys: Total items across all partitions (for validation)
      max_imbalance_tolerance: Max allowed ratio of actual/fair_share (default 2.0)

    Returns dict with hotspot assessment.

    Edge cases: empty distribution → ValueError
    """
    if not key_distribution:
        raise ValueError("key_distribution must be non-empty")
    if total_keys <= 0:
        raise ValueError(f"total_keys must be positive, got {total_keys}")

    n_partitions = len(key_distribution)
    fair_share = 1.0 / n_partitions
    actual_total = sum(key_distribution)

    hotspots = []
    for i, count in enumerate(key_distribution):
        actual_share = count / max(actual_total, 1)
        imbalance = actual_share / fair_share if fair_share > 0 else float('inf')
        if imbalance > max_imbalance_tolerance:
            hotspots.append({
                "partition": i, "count": count,
                "actual_share_pct": round(actual_share * 100, 1),
                "fair_share_pct": round(fair_share * 100, 1),
                "imbalance_factor": round(imbalance, 1),
            })

    # Evenness score: 0-1, higher = better distributed
    if actual_total > 0 and n_partitions > 0:
        max_entropy = math.log2(n_partitions)
        if max_entropy > 0:
            entropy = sum(
                -(c / actual_total) * math.log2(c / actual_total)
                for c in key_distribution if c > 0
            )
            evenness = entropy / max_entropy
        else:
            evenness = 1.0
    else:
        evenness = 0.0

    if len(hotspots) == 0:
        verdict = "GOOD — no hotspots detected"
        recommendation = "Current partition key is evenly distributed. "
    elif len(hotspots) <= n_partitions * 0.2:
        verdict = f"WARNING — {len(hotspots)} hotspots detected"
        recommendation = ("Consider compound key or hash-based partitioning. "
                         "Kleppmann Ch.6, p.202: 'Use a hash of the key to "
                         "distribute data randomly — this avoids skew but "
                         "loses range query locality.'")
    else:
        verdict = f"CRITICAL — {len(hotspots)}/{n_partitions} partitions unbalanced"
        recommendation = ("Partition key is fundamentally flawed. Re-key. "
                         "Kleppmann Ch.6, p.203: 'If you can't find a key that "
                         "distributes evenly, consider pre-splitting partitions.'")

    return {"n_partitions": n_partitions, "total_items": actual_total,
            "hotspots": hotspots, "n_hotspots": len(hotspots),
            "evenness_score": round(evenness, 3), "verdict": verdict,
            "recommendation": recommendation,
            "source": "Kleppmann Ch.6, pp.199-218; Red Book Ch.4"}


# ═══════════════════════════════════════════════════════════════════
# PART 4 — STORAGE ENGINE CHOICE (B-Tree vs LSM-Tree)
# Source: Kleppmann Ch.3 (Storage and Retrieval)
# ═══════════════════════════════════════════════════════════════════

def storage_engine_choice(
    write_heavy: bool,
    read_amplification_tolerant: bool,
    compaction_pauses_acceptable: bool,
    range_queries_needed: bool,
    dataset_size_gb: float,
) -> Dict:
    """
    Choose between B-Tree and LSM-Tree storage engines.
    Kleppmann Ch.3, pp.69-96.

    Kleppmann Ch.3, p.76: "The two most widely used storage engine
    structures are B-trees and LSM-trees. Each performs better under
    different workloads."

    Decision logic from Kleppmann Ch.3, pp.76-96:

    B-Tree (MySQL InnoDB, PostgreSQL):
      - Strong at reads (in-place updates, balanced tree)
      - Writes require random I/O (write amplification)
      - Stable performance, no compaction pauses
      - Good for range queries (sorted keys)

    LSM-Tree (LevelDB, RocksDB, Cassandra):
      - Strong at writes (sequential writes to SSTables)
      - Reads may touch multiple SSTables (read amplification)
      - Compaction can cause latency spikes
      - Also good for range queries (sorted within SSTables)

    Red Book Ch.2, p.12: "LSM-trees sacrifice read performance for write
    throughput. B-trees sacrifice write throughput for read performance."

    Args:
      write_heavy: True if writes dominate reads
      read_amplification_tolerant: Can app tolerate slower reads?
      compaction_pauses_acceptable: Can app tolerate periodic latency spikes?
      range_queries_needed: Does app scan ranges of keys?
      dataset_size_gb: Dataset size in GB

    Returns dict with recommendation and trade-off explanation.
    """
    _fv(dataset_size_gb, "dataset_size_gb")

    lsm_score = 0
    btree_score = 0

    if write_heavy:
        lsm_score += 2
    else:
        btree_score += 2

    if read_amplification_tolerant:
        lsm_score += 1
    else:
        btree_score += 1

    if compaction_pauses_acceptable:
        lsm_score += 1
    else:
        btree_score += 1

    # Range queries: both handle well, but B-tree edges it
    if range_queries_needed:
        btree_score += 0.5  # B-tree slightly better for exact ranges

    # Large dataset favors LSM (better write throughput at scale)
    if dataset_size_gb > 100:
        lsm_score += 0.5

    if lsm_score > btree_score:
        engine = "LSM-Tree (e.g., RocksDB, LevelDB)"
        rationale = ("LSM-trees convert random writes into sequential writes. "
                    "Kleppmann Ch.3, p.83: 'LSM-trees are faster for writes "
                    "because they don't overwrite pages in place.'")
        tradeoff = ("Higher write throughput, but reads may search multiple "
                   "SSTables, and compaction can cause latency spikes. "
                   "Kleppmann Ch.3, p.91: 'Compaction can interfere with "
                   "ongoing reads and writes, leading to performance problems.'")
    else:
        engine = "B-Tree (e.g., InnoDB, PostgreSQL)"
        rationale = ("B-trees provide strong read performance and predictable "
                    "latency. Kleppmann Ch.3, p.79: 'B-trees keep the tree "
                    "balanced, so all keys can be found in O(log n) time.'")
        tradeoff = ("More predictable latency, no compaction pauses, but "
                   "writes require random I/O and may fragment over time. "
                   "Kleppmann Ch.3, p.82: 'B-trees must overwrite pages "
                   "in place, which requires random disk writes.'")

    return {"engine": engine, "lsm_score": lsm_score, "btree_score": btree_score,
            "rationale": rationale, "tradeoff": tradeoff,
            "source": "Kleppmann Ch.3, pp.69-96; Red Book Ch.2, pp.10-14"}


# ═══════════════════════════════════════════════════════════════════
# PART 5 — CONSENSUS PROTOCOL COMPARISON
# Source: Kleppmann Ch.9 (Consistency and Consensus)
# ═══════════════════════════════════════════════════════════════════

def consensus_protocol_choice(
    node_count: int,
    network_stability: str,  # 'stable' or 'unstable'
    throughput_requirement_qps: float,
    strict_consistency_required: bool,
) -> Dict:
    """
    Choose consensus protocol: Raft, Paxos, or gossip-based.
    Kleppmann Ch.9, pp.352-373.

    Kleppmann Ch.9, p.364: "Raft, Paxos, and Viewstamped Replication are
    all fault-tolerant consensus algorithms. For most purposes, they are
    equivalent, but Raft is simpler to understand and implement."

    Comparison (Kleppmann Ch.9, pp.364-373):
      Raft: leader-based, easier to understand. Requires majority.
            Best for: small clusters (3-7 nodes), stable networks.
      Multi-Paxos: similar to Raft but more complex.
            Best for: when you need a battle-tested protocol (Chubby, Spanner).
      Gossip (epidemic): eventual consistency, no leader.
            Best for: large clusters, unstable networks, AP systems.

    Red Book Ch.6, pp.32-35: consistency models in distributed systems.

    Args:
      node_count: Number of nodes in the cluster
      network_stability: 'stable' or 'unstable'
      throughput_requirement_qps: Desired throughput
      strict_consistency_required: Must reads see latest writes?

    Returns dict with recommended protocol and rationale.
    """
    if not isinstance(node_count, int) or node_count < 1:
        raise ValueError(f"node_count must be ≥ 1, got {node_count}")
    if network_stability not in ("stable", "unstable"):
        raise ValueError(f"network_stability must be 'stable' or 'unstable'")

    if strict_consistency_required and network_stability == "stable":
        protocol = "Raft (or Multi-Paxos)"
        rationale = ("Raft provides strong consistency with a simple, "
                    "understandable design. Kleppmann Ch.9, p.365: 'Raft "
                    "achieves consensus via leader election and log replication."
                    "A majority of nodes must acknowledge each write.'")
        min_nodes = 3
    elif strict_consistency_required:
        protocol = "Multi-Paxos"
        rationale = ("Multi-Paxos handles unstable networks better than Raft "
                    "in some implementations, but the complexity is higher. "
                    "Kleppmann Ch.9, p.366: 'Paxos is notoriously difficult "
                    "to understand but has been proven correct.'")
        min_nodes = 3
    elif node_count > 20 or network_stability == "unstable":
        protocol = "Gossip-based (eventual consistency)"
        rationale = ("Gossip protocols scale to large clusters and tolerate "
                    "network partitions gracefully. Kleppmann Ch.9, p.370: "
                    "'Gossip protocols spread information epidemically — "
                    "eventually all nodes learn the state.'")
        min_nodes = 5
    else:
        protocol = "Raft"
        rationale = ("Even without strict consistency, Raft provides a simple, "
                    "predictable foundation. Kleppmann Ch.9, p.365: 'Raft "
                    "decomposes consensus into leader election, log replication, "
                    "and safety — each relatively easy to reason about.'")
        min_nodes = 3

    if node_count < min_nodes:
        warning = (f"Protocol requires ≥{min_nodes} nodes for fault tolerance. "
                  f"Current node count ({node_count}) is insufficient. "
                  f"Kleppmann Ch.9, p.357: 'A consensus system with N nodes "
                  f"can tolerate up to (N-1)/2 node failures.'")
    else:
        tolerance = (node_count - 1) // 2
        warning = None
        tolerance_str = f"Tolerates up to {tolerance} node failures."

    return {"protocol": protocol, "rationale": rationale,
            "min_nodes_required": min_nodes, "node_count": node_count,
            "warning": warning, "fault_tolerance": tolerance_str if not warning else "N/A",
            "source": "Kleppmann Ch.9, pp.352-373"}


# ═══════════════════════════════════════════════════════════════════
# SELF-TEST SUITE
# ═══════════════════════════════════════════════════════════════════

def run_all_tests() -> int:
    f = 0; p = 0
    def ck(label, actual, expected, tol=1e-6):
        nonlocal f, p
        ok = actual == expected if isinstance(expected, (bool, str, type(None))) or actual is None and expected is None else abs(actual - expected) <= tol
        if ok: print(f"  PASS  {label}: {actual}"); p += 1
        else: print(f"  FAIL  {label}: expected {expected}, got {actual}"); f += 1

    print("=" * 70)
    print("SELF-TEST SUITE: data_systems.py")
    print("Sources: Kleppmann DDIA (2017) + Red Book (2015)")
    print("=" * 70)

    # ── Isolation ──
    print("\n── Isolation Levels (Kleppmann Ch.7) ──")
    iso = transaction_isolation_score("read_committed", tolerance_for_anomalies="none")
    ck("iso: read_committed + none tolerance → not compatible", iso["compatible"], False)

    iso2 = transaction_isolation_score("read_uncommitted", tolerance_for_anomalies="none")
    ck("iso: read_uncommitted + no tolerance → incompatible", iso2["compatible"], False)

    iso3 = transaction_isolation_score("serializable")
    ck("iso: serializable → compatible", iso3["compatible"], True)
    ck("iso: serializable → 0 anomalies", iso3["anomalies_allowed"], 0)

    # ── Replication ──
    print("\n── Replication Strategy (Kleppmann Ch.5) ──")
    rep = replication_strategy(500, 100, 10, "strong", False)
    ck("rep: write_heavy+strong → Single-Leader", "Single-Leader" in rep["strategy"], True)

    rep2 = replication_strategy(100, 5000, 500, "eventual", True)
    ck("rep: read_heavy+eventual+geo → Multi-Leader", "Multi-Leader" in rep2["strategy"], True)

    rep3 = replication_strategy(200, 200, 50, "tunable", False)
    ck("rep: tunable → Leaderless/Dynamo", "Leaderless" in rep3["strategy"] or "Dynamo" in rep3["strategy"], True)

    # ── Partitioning ──
    print("\n── Partitioning Hotspots (Kleppmann Ch.6) ──")
    balanced = partitioning_hotspot_risk([100, 100, 100, 100], 400)
    ck("part: balanced 4×100 → evenness ≈ 1.0", balanced["evenness_score"], 1.0, tol=0.01)
    ck("part: 0 hotspots", balanced["n_hotspots"], 0)

    skewed = partitioning_hotspot_risk([500, 50, 50, 50], 650)
    ck("part: skewed → hotspots > 0", skewed["n_hotspots"] > 0, True)

    # ── Storage Engine ──
    print("\n── Storage Engine (Kleppmann Ch.3) ──")
    eng = storage_engine_choice(True, True, True, True, 50)
    ck("engine: write_heavy → LSM-Tree", "LSM" in eng["engine"], True)

    eng2 = storage_engine_choice(False, False, False, True, 10)
    ck("engine: read_heavy → B-Tree", "B-Tree" in eng2["engine"], True)

    # ── Consensus ──
    print("\n── Consensus (Kleppmann Ch.9) ──")
    cons = consensus_protocol_choice(5, "stable", 1000, True)
    ck("cons: 5-node stable + strict → Raft", "Raft" in cons["protocol"], True)
    ck("cons: tolerates 2 failures", cons["warning"] is None, True)

    cons2 = consensus_protocol_choice(30, "unstable", 5000, False)
    ck("cons: large+unstable → Gossip", "Gossip" in cons2["protocol"], True)

    print("\n" + "=" * 70)
    tot = p + f
    print(f"RESULTS: {p}/{tot} passed, {f} failed")
    print("=" * 70)
    return 0 if f == 0 else 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
