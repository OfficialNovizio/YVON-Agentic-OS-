"""plan_lock.py — Rail 1 plan-lock enforcement (MASTER.md PART 2 §plan-lock, PART 8).

Before any retrieval, the plan (query + agent identity + department) is
hashed and recorded append-only in store/plan-lock.jsonl. At execution time,
callers re-derive the id and HALT on deviation. A lock against an untrusted
identity (unknown department) is recorded as 'blocked' and raises
PlanLockViolation — retrieval degrades loudly instead of failing silently,
and the executor layer halts on a blocked/violated lock.

Telemetry rule (YVON-CHAT §8.5): this must never break a run. Log writes are
best-effort; failures are swallowed (the in-memory record still stands).
"""
from __future__ import annotations

import hashlib
import json
import os
import time
from typing import Any, Optional

KNOWN_DEPARTMENTS = {
    "Executive Office", "Governance", "Engineering", "Product",
    "Brand Studio", "Cybersecurity", "AI & Agents", "Books", "Shared OS",
    # 2026-08-15 — 6 new departments merged in from origin.
    "Client Success", "Comms & PR", "Global Expansion",
    "Growth & Partnerships", "People & Culture", "Risk & ESG",
}


class PlanLockViolation(Exception):
    """Raised when the plan cannot be locked (untrusted identity / deviation)."""


def plan_id(query: str, agent_id: str, agent_dept: str, salt: str = "yvon-plan-v1") -> str:
    """Deterministic lock id — re-derived at execution time to catch deviation."""
    h = hashlib.sha256()
    h.update(salt.encode("utf-8"))
    h.update((agent_dept or "").encode("utf-8"))
    h.update(b"|")
    h.update((agent_id or "").encode("utf-8"))
    h.update(b"|")
    h.update((query or "").encode("utf-8"))
    return h.hexdigest()[:16]


def plan_lock(
    query: str,
    agent_id: str = "",
    agent_dept: str = "",
    root: Optional[str] = None,
    log_path: Optional[str] = None,
) -> dict[str, Any]:
    """Create + append the retrieval plan lock.

    Returns the lock record. Raises PlanLockViolation if the department is not
    a known YVON department (untrusted identity — Rail 1 fail-closed). Log
    write failure never blocks retrieval.
    """
    dept = (agent_dept or "").strip()
    authorized = dept in KNOWN_DEPARTMENTS
    pid = plan_id(query, agent_id, dept)
    record = {
        "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "plan_id": pid,
        "agent_id": agent_id or "system",
        "department": dept,
        "query_hash": hashlib.sha256((query or "").encode("utf-8")).hexdigest()[:16],
        "status": "locked" if authorized else "blocked",
    }
    root = root or os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
    log_path = log_path or os.path.join(root, "store", "plan-lock.jsonl")
    try:
        os.makedirs(os.path.dirname(log_path), exist_ok=True)
        with open(log_path, "a", encoding="utf-8") as fh:
            fh.write(json.dumps(record) + "\n")
    except OSError:
        pass  # telemetry never breaks retrieval
    if not authorized:
        raise PlanLockViolation(f"plan-lock blocked: unknown department '{dept}' (Rail 1)")
    return record


def verify_plan_lock(
    record: Optional[dict[str, Any]],
    query: str,
    agent_id: str,
    agent_dept: str,
) -> bool:
    """Re-derive the lock id at execution time; mismatch = deviation → halt."""
    if not record:
        return False
    expected = plan_id(query, agent_id, agent_dept)
    return record.get("plan_id") == expected
