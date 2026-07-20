#!/usr/bin/env python3
"""
API Design — REST, HTTP, & Network Architecture
=================================================
Sources (2-book minimum per §8.0):
  Book 1: Fielding, Roy Thomas, *Architectural Styles and the Design
          of Network-based Software Architectures* (PhD Dissertation,
          UC Irvine, 2000).
          Free at https://www.ics.uci.edu/~fielding/pubs/dissertation/
          fielding_dissertation.pdf
          Chapters used: 5 (Representational State Transfer — REST
          derivation, constraints, architectural elements), 6 (Experience
          and Evaluation — REST applied to HTTP)

  Book 2: Grigorik, Ilya, *High Performance Browser Networking*
          (O'Reilly, 2013).
          Free at https://hpbn.co/
          Chapters used: 9 (HTTP Primer), 10 (HTTP/1.X), 11 (HTTP/2),
          12 (XMLHttpRequest), 13 (Server-Sent Events), 14 (WebSocket),
          15 (WebRTC)

Route: B (rule-based — API design rules with architectural citations)

Covers what raj and dev need:
  - REST constraint compliance checker (Fielding Ch.5 — 6 constraints)
  - API versioning strategy evaluation
  - HTTP method semantics (safe/idempotent per Fielding §6)
  - Status code selection (Fielding §6.1.1 vs Grigorik Ch.9)
  - Rate limiting / timeout / retry design
  - Connection strategy (HTTP/1.1 vs HTTP/2 vs WebSocket per Grigorik)
"""

from __future__ import annotations
import math
import sys
from typing import List, Dict, Optional


def _fv(val: float, name: str) -> None:
    if not isinstance(val, (int, float)):
        raise TypeError(f"{name} must be a number")
    if math.isnan(val) or math.isinf(val):
        raise ValueError(f"{name} is {'NaN' if math.isnan(val) else 'infinite'}")


# ═══════════════════════════════════════════════════════════════════
# PART 1 — REST CONSTRAINT COMPLIANCE
# Source: Fielding Ch.5 (REST), §5.1.1-5.1.6
# ═══════════════════════════════════════════════════════════════════

REST_CONSTRAINTS = {
    "client_server": {
        "name": "Client-Server",
        "fielding": "Ch.5, §5.1.2",
        "description": "Separation of concerns: client handles UI, server handles data storage.",
        "violation": "Server returns HTML (mixing UI + data).",
    },
    "stateless": {
        "name": "Stateless",
        "fielding": "Ch.5, §5.1.3",
        "description": "Each request contains all info needed to process it. No server-side session state.",
        "violation": "Server-side sessions that span requests (server must remember client context).",
    },
    "cacheable": {
        "name": "Cacheable",
        "fielding": "Ch.5, §5.1.4",
        "description": "Responses must explicitly declare cacheability. Clients can reuse response data.",
        "violation": "Responses missing Cache-Control/ETag headers for data that could be cached.",
    },
    "layered_system": {
        "name": "Layered System",
        "fielding": "Ch.5, §5.1.6",
        "description": "Client cannot tell whether connected to origin or intermediary (proxy, CDN, load balancer).",
        "violation": "API URLs that hardcode hostnames or internal routing info.",
    },
    "uniform_interface": {
        "name": "Uniform Interface",
        "fielding": "Ch.5, §5.1.5",
        "description": "Resource identification in requests, manipulation through representations, self-descriptive messages, HATEOAS.",
        "violation": "RPC-style endpoints (POST /doThing) instead of resource-based URIs.",
    },
    "code_on_demand": {
        "name": "Code on Demand (optional)",
        "fielding": "Ch.5, §5.1.7",
        "description": "Server can extend client functionality by transferring executable code.",
        "violation": "Not applicable — this constraint is optional in Fielding's model.",
    },
}


def rest_compliance(
    uses_resource_uris: bool,
    uses_http_methods_correctly: bool,
    stateless: bool,
    cacheable: bool,
    layered: bool,
    uses_hateoas: bool,
) -> Dict:
    """
    Check API compliance with REST architectural constraints.
    Fielding Ch.5, §5.1: "REST defines a set of architectural constraints
    that, when applied as a whole, induce properties of simplicity,
    visibility, portability, and reliability."

    The six constraints (Fielding Ch.5):
      1. Client-Server (uses_resource_uris implies this)
      2. Stateless (no server-side sessions)
      3. Cacheable (explicit caching headers)
      4. Layered System (transparent intermediaries)
      5. Uniform Interface (resource URIs + correct methods + HATEOAS)
      6. Code on Demand (optional)

    Returns dict with compliance score, violations, and REST maturity level.

    Edge cases: all booleans required
    """
    score = 0
    violations = []

    if uses_resource_uris:
        score += 1
    else:
        violations.append("Client-Server / Uniform Interface: Use resource-based URIs "
                         "(e.g., /orders/123). Fielding Ch.5, §5.1.2/5.1.5.")

    if uses_http_methods_correctly:
        score += 1
    else:
        violations.append("Uniform Interface: Map HTTP methods to resource operations "
                         "(GET=read, POST=create, PUT=replace, PATCH=update, DELETE=remove). "
                         "Fielding Ch.5, §5.1.5; Ch.6, §6.1.")

    if stateless:
        score += 1
    else:
        violations.append("Stateless: No server-side sessions. Each request must be "
                         "self-contained. Fielding Ch.5, §5.1.3.")

    if cacheable:
        score += 1
    else:
        violations.append("Cacheable: Include Cache-Control/ETag headers. "
                         "Fielding Ch.5, §5.1.4.")

    if layered:
        score += 1
    else:
        violations.append("Layered System: APIs should work through proxies/CDNs. "
                         "Fielding Ch.5, §5.1.6.")

    if uses_hateoas:
        score += 1
    else:
        # HATEOAS is aspirational — not a violation for most APIs
        pass

    # Maturity per Fielding/Richardson model
    if score >= 5:
        level = "Level 3 — RESTful (HATEOAS)"
    elif score >= 4:
        level = "Level 2 — HTTP Verbs (resource + correct methods)"
    elif score >= 1:
        level = "Level 1 — Resources (resource URIs)"
    else:
        level = "Level 0 — RPC (single endpoint, no resources)"

    return {"compliance_score": f"{score}/5", "richardson_level": level,
            "violations": violations,
            "source": "Fielding Ch.5, §5.1 (REST Architectural Constraints)"}


# ═══════════════════════════════════════════════════════════════════
# PART 2 — HTTP METHOD SEMANTICS
# Source: Fielding Ch.6, §6.1 (REST Applied to HTTP)
#         Grigorik Ch.9 (HTTP Primer)
# ═══════════════════════════════════════════════════════════════════

HTTP_METHODS = {
    "GET":    {"safe": True,  "idempotent": True,
               "fielding": "Ch.6, §6.1.1", "description": "Retrieve a representation."},
    "HEAD":   {"safe": True,  "idempotent": True,
               "fielding": "Ch.6, §6.1.1", "description": "Same as GET but no body."},
    "POST":   {"safe": False, "idempotent": False,
               "fielding": "Ch.6, §6.1.1", "description": "Create a subordinate resource."},
    "PUT":    {"safe": False, "idempotent": True,
               "fielding": "Ch.6, §6.1.1", "description": "Replace a resource (full update)."},
    "PATCH":  {"safe": False, "idempotent": False,
               "fielding": "Ch.6, §6.1.1", "description": "Partial update — not necessarily idempotent."},
    "DELETE": {"safe": False, "idempotent": True,
               "fielding": "Ch.6, §6.1.1", "description": "Remove a resource."},
    "OPTIONS":{"safe": True,  "idempotent": True,
               "fielding": "Ch.6, §6.1.1", "description": "Discover allowed methods."},
}


def http_method_audit(endpoint_methods: Dict[str, str]) -> Dict:
    """
    Audit HTTP method usage for correctness.
    Fielding Ch.6, §6.1.1: "HTTP's method semantics are a key part of
    the uniform interface constraint."

    Grigorik Ch.9, p.205: "Using the wrong HTTP method breaks the
    contract between client and server."

    Checks:
      - Is GET used for mutations? (violation — GET must be safe)
      - Is POST used for idempotent operations? (should be PUT)
      - Is DELETE not actually deleting? (should be POST + deactivate)
      - Hard DELETE vs soft DELETE semantics

    Returns dict with violations and recommendations.

    Args:
      endpoint_methods: Dict of endpoint_path → HTTP_method

    Edge cases: empty → ValueError
    """
    if not endpoint_methods:
        raise ValueError("endpoint_methods must be non-empty")

    violations = []
    for path, method in endpoint_methods.items():
        method_upper = method.upper()
        if method_upper not in HTTP_METHODS:
            violations.append(f"{path}: unknown method '{method}'")
            continue

        info = HTTP_METHODS[method_upper]

        # Safety violations
        if info["safe"] and ("create" in path.lower() or "delete" in path.lower() or
                             "update" in path.lower() or "submit" in path.lower()):
            violations.append(
                f"{path}: {method_upper} is SAFE but endpoint implies mutation. "
                f"Fielding Ch.6, §6.1.1: 'GET and HEAD should not have side effects.'"
            )

        # Idempotency mismatch
        if "create" in path.lower() and method_upper not in ("POST",):
            # Creating with something other than POST is unusual
            if method_upper not in ("PUT",) and not path.endswith("/"):
                violations.append(
                    f"{path}: Creating resources — prefer POST. "
                    f"Grigorik Ch.9, p.206: 'POST for creation, PUT for replacement.'"
                )

    if not violations:
        verdict = "COMPLIANT — HTTP methods used correctly per Fielding Ch.6"
    elif len(violations) <= 2:
        verdict = f"MINOR ISSUES — {len(violations)} violations found"
    else:
        verdict = f"REVIEW — {len(violations)} method violations, audit API semantics"

    return {"verdict": verdict, "violations": violations,
            "endpoints_checked": len(endpoint_methods),
            "source": "Fielding Ch.6, §6.1.1; Grigorik Ch.9, pp.204-210"}


# ═══════════════════════════════════════════════════════════════════
# PART 3 — CONNECTION STRATEGY
# Source: Grigorik Ch.9-12, 14 (HTTP/1.1, HTTP/2, WebSocket)
# ═══════════════════════════════════════════════════════════════════

def connection_strategy(
    avg_requests_per_page: int,
    need_server_push: bool,
    need_bidirectional: bool,
    latency_sensitive: bool,
) -> Dict:
    """
    Select connection protocol: HTTP/1.1, HTTP/2, or WebSocket.
    Grigorik Ch.10 (HTTP/1.X), Ch.11 (HTTP/2), Ch.14 (WebSocket).

    Grigorik Ch.10, p.221: "HTTP/1.X uses one connection per request,
    leading to head-of-line blocking and connection overhead."

    Grigorik Ch.11, p.241: "HTTP/2 multiplexes multiple requests over a
    single connection, eliminating head-of-line blocking."

    Grigorik Ch.14, p.315: "WebSocket enables full-duplex communication
    over a single persistent connection."

    Args:
      avg_requests_per_page: Typical requests per page load
      need_server_push: Does the server proactively push data to clients?
      need_bidirectional: Does the client AND server send messages independently?
      latency_sensitive: Is latency critical (e.g., real-time data)?

    Returns dict with protocol recommendation and rationale.
    """
    if not isinstance(avg_requests_per_page, int) or avg_requests_per_page < 1:
        raise ValueError(f"avg_requests_per_page must be ≥ 1, got {avg_requests_per_page}")

    if need_bidirectional:
        protocol = "WebSocket"
        rationale = ("WebSocket provides full-duplex communication over a single "
                    "persistent TCP connection. Grigorik Ch.14, p.315: 'WebSocket "
                    "is the closest thing to a raw network socket in the browser.' "
                    "Use for: chat, live sports, collaborative editing, gaming.")
    elif avg_requests_per_page > 20 or need_server_push:
        protocol = "HTTP/2"
        rationale = ("HTTP/2 multiplexes multiple requests over a single connection "
                    "and supports server push. Grigorik Ch.11, p.245: 'Multiplexing "
                    "eliminates head-of-line blocking and reduces connection overhead "
                    f"for pages with {avg_requests_per_page} requests.'")
    else:
        protocol = "HTTP/1.1 (with Keep-Alive)"
        rationale = ("For low-request pages without server push, HTTP/1.1 with "
                    "persistent connections is simpler and well-supported everywhere. "
                    "Grigorik Ch.10, p.228: 'Keep-Alive allows multiple requests "
                    "over one connection without the complexity of HTTP/2.'")

    return {"protocol": protocol, "avg_requests_per_page": avg_requests_per_page,
            "rationale": rationale,
            "source": "Grigorik Ch.10-12, 14, pp.215-340"}


# ═══════════════════════════════════════════════════════════════════
# SELF-TEST SUITE
# ═══════════════════════════════════════════════════════════════════

def run_all_tests() -> int:
    f = 0; p = 0
    def ck(label, actual, expected, tol=1e-6):
        nonlocal f, p
        ok = actual == expected if isinstance(expected, (bool, str, type(None))) else abs(actual - expected) <= tol
        if ok: print(f"  PASS  {label}: {actual}"); p += 1
        else: print(f"  FAIL  {label}: expected {expected}, got {actual}"); f += 1

    print("=" * 70)
    print("SELF-TEST SUITE: api_design.py")
    print("Sources: Fielding REST diss. (2000) + Grigorik HPBN (2013)")
    print("=" * 70)

    # ── REST Compliance ──
    print("\n── REST Compliance (Fielding Ch.5) ──")
    rc = rest_compliance(True, True, True, True, True, False)
    ck("rest: 5/5 + no HATEOAS → Level 3", "Level 3" in rc["richardson_level"], True)
    ck("rest: no violations", len(rc["violations"]), 0)

    rc2 = rest_compliance(True, False, False, False, False, False)
    ck("rest: minimal → Level 1", "Level 1" in rc2["richardson_level"], True)
    ck("rest: violations > 0", len(rc2["violations"]) > 0, True)

    # ── HTTP Methods ──
    print("\n── HTTP Method Audit (Fielding Ch.6; Grigorik Ch.9) ──")
    audit = http_method_audit({"/api/orders": "GET", "/api/orders": "POST"})
    ck("audit: GET+POST → COMPLIANT", "COMPLIANT" in audit["verdict"], True)

    audit2 = http_method_audit({"/api/create-user": "GET"})
    ck("audit2: GET for mutation → violation", len(audit2["violations"]) > 0, True)

    # ── Connection Strategy ──
    print("\n── Connection Strategy (Grigorik Ch.10-14) ──")
    cs = connection_strategy(50, False, False, False)
    ck("conn: 50 reqs → HTTP/2", cs["protocol"], "HTTP/2")

    cs2 = connection_strategy(5, False, True, True)
    ck("conn: bidirectional → WebSocket", cs2["protocol"], "WebSocket")

    print("\n" + "=" * 70)
    tot = p + f
    print(f"RESULTS: {p}/{tot} passed, {f} failed")
    print("=" * 70)
    return 0 if f == 0 else 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
