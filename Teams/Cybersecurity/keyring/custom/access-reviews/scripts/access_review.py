#!/usr/bin/env python3
"""
access_review.py — diff actual entitlements against least-privilege role baselines.

Owner: keyring (Cybersecurity / IAM), skill: access-reviews.
Produces a complete, repeatable recertification diff: over-grants (revoke-then-
appeal), under-grants, orphans (accounts with no role), and role-mismatches.
keyring produces the diff + recommendation; the OPERATOR/IdP executes revocations
(the security-inversion — this script never revokes, it reports).

Deterministic set arithmetic — no reasoning-based thresholds here (the review
CADENCE is operator-set config, not part of the diff).

Usage:
  python3 access_review.py --baselines roles.json --actual identities.json
    roles.json:      {"role": ["entitlement", ...], ...}
    identities.json: [{"id":"alice","role":"eng","entitlements":["a","b"]}, ...]
  python3 access_review.py --test
Stdlib only. No network, no writes, no revocation (charter-clean, inversion-safe).
"""
import argparse, json, sys


def review(baselines, identities):
    over, under, orphans, ok = [], [], [], []
    for idn in identities:
        who, role = idn.get("id", "?"), idn.get("role")
        have = set(idn.get("entitlements", []))
        if role is None or role not in baselines:
            orphans.append({"id": who, "role": role, "entitlements": sorted(have),
                            "reason": "no role" if role is None else f"unknown role '{role}'"})
            continue
        base = set(baselines[role])
        excess = sorted(have - base)      # over-grants → revoke-then-appeal
        missing = sorted(base - have)     # under-grants (rare)
        if excess:
            over.append({"id": who, "role": role, "revoke": excess})
        if missing:
            under.append({"id": who, "role": role, "grant": missing})
        if not excess and not missing:
            ok.append(who)
    return {
        "over_grants_revoke": over,     # → operator executes revocation
        "under_grants": under,
        "orphans": orphans,             # → warden register
        "recertified_clean": ok,
        "summary": {"reviewed": len(identities), "with_over_grants": len(over),
                    "orphans": len(orphans), "clean": len(ok)},
        "note": "keyring reports; OPERATOR/IdP executes revocations (security-inversion). "
                "Revoke-then-appeal: over-grants are removed by default.",
    }


# ----------------------------- self-tests -----------------------------
def _run_tests():
    ok = True

    def check(name, cond):
        nonlocal ok
        print(f"  [{'PASS' if cond else 'FAIL'}] {name}")
        ok = ok and cond

    baselines = {"eng": ["repo:read", "ci:read"], "admin": ["repo:read", "repo:admin", "cloud:admin"]}
    identities = [
        {"id": "alice", "role": "eng", "entitlements": ["repo:read", "ci:read"]},               # clean
        {"id": "bob", "role": "eng", "entitlements": ["repo:read", "ci:read", "cloud:admin"]},   # over-grant
        {"id": "carol", "role": "eng", "entitlements": ["repo:read"]},                           # under-grant
        {"id": "dave", "role": None, "entitlements": ["repo:read"]},                             # orphan
        {"id": "eve", "role": "ghostrole", "entitlements": ["x"]},                               # unknown role
    ]
    r = review(baselines, identities)

    check("alice recertified clean", "alice" in r["recertified_clean"])
    check("bob flagged over-grant cloud:admin",
          any(o["id"] == "bob" and o["revoke"] == ["cloud:admin"] for o in r["over_grants_revoke"]))
    check("carol flagged under-grant ci:read",
          any(u["id"] == "carol" and u["grant"] == ["ci:read"] for u in r["under_grants"]))
    check("dave flagged orphan (no role)",
          any(o["id"] == "dave" and o["reason"] == "no role" for o in r["orphans"]))
    check("eve flagged orphan (unknown role)",
          any(o["id"] == "eve" and "unknown role" in o["reason"] for o in r["orphans"]))
    check("summary counts", r["summary"] == {"reviewed": 5, "with_over_grants": 1, "orphans": 2, "clean": 1})

    # revoke-then-appeal: over-grant is REVOKE, never auto-kept
    check("over-grant is a revoke recommendation", "revoke" in r["over_grants_revoke"][0])
    # inversion: output reports, never claims to have revoked
    blob = json.dumps(r).lower()
    check("script reports, does not revoke", "revoked" not in blob and "executes" in r["note"].lower())

    # empty / all-clean case
    r2 = review(baselines, [{"id": "x", "role": "eng", "entitlements": ["repo:read", "ci:read"]}])
    check("all-clean → no over-grants", r2["summary"]["with_over_grants"] == 0)

    print("ALL PASSED" if ok else "SOME FAILED")
    return 0 if ok else 1


def main():
    ap = argparse.ArgumentParser(description="keyring access-review diff (reports; never revokes)")
    ap.add_argument("--baselines", help="JSON: {role: [entitlement,...]}")
    ap.add_argument("--actual", help="JSON: [{id, role, entitlements:[...]}]")
    ap.add_argument("--test", action="store_true")
    args = ap.parse_args()
    if args.test:
        return _run_tests()
    if not args.baselines or not args.actual:
        ap.error("provide --baselines and --actual, or --test")
    with open(args.baselines) as f:
        baselines = json.load(f)
    with open(args.actual) as f:
        identities = json.load(f)
    print(json.dumps(review(baselines, identities), indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
