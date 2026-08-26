#!/usr/bin/env python3
# fetch-orgbook-bc-leads.py — full BC registry enumeration into company_leads
# (migration 130), automatically, page by page.
#
# Why this exists: the Job Hunt leads system pulled OrgBook via keyword search
# (/v4/search/topic?q=<keyword>), which caps at ~100 results per query — page
# 12 returns HTTP 400 no matter how large `total` claims to be (verified
# empirically 2026-08-15 in fetch-orgbook-leads.mjs, re-verified 2026-08-25).
# Search cannot enumerate the registry, so "every business in BC" never
# happened. This puller walks /v4/search/credential with PREFIX queries
# (q=a, q=b, …), and whenever a prefix's total still exceeds the cap it
# subdivides one character deeper (a → aa, ab, …) until every leaf fits.
# Active entities only (inactive=false + entity_status=ACT) — a business is
# included whether or not it is hiring; the registry is the directory.
#
# The pull is deliberately incremental: OrgBook is read 10 at a time,
# batches of 100 upsert into company_leads with dedup (Prefer:
# resolution=ignore-duplicates) — existing rows are untouched, the table
# grows with the delta. Resumable: pull state is written to
# company_lead_pull_state (migration 131) after each top-level prefix.
#
# Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — from
# /root/.yvon-supabase.env (the clean source of truth).
#
# Usage:
#   python3 fetch-orgbook-bc-leads.py             # full walk (first run: hours, detached)
#   python3 fetch-orgbook-bc-leads.py --prefix=ab # resume at a prefix
#   python3 fetch-orgbook-bc-leads.py --limit=500 # stop after N new rows (test)
#
# Nightly cron (after install):
#   45 2 * * * /usr/bin/python3 /root/YVON-Agentic-OS-/vps-scripts/fetch-orgbook-bc-leads.py >> /var/log/yvon-jobhunt/orgbook.log 2>&1

import json
import os
import sys
import time
import urllib.parse
import urllib.request

ENV_FILE = os.environ.get("YVON_SUPABASE_ENV", "/root/.yvon-supabase.env")
ORGBOOK_BASE = "https://orgbook.gov.bc.ca/api/v4/search/credential"
CHARS = "abcdefghijklmnopqrstuvwxyz0123456789"
CAP = 100        # OrgBook per-query ceiling (page 12 → 400, verified 2026-08-25)
PAGE_SIZE = 10   # OrgBook's fixed page size
MAX_DEPTH = 4    # prefix-subdivision recursion guard
BATCH = 100      # Supabase upsert batch
PACING = 0.5     # seconds between OrgBook calls — this is a public gov API; be polite
RETRIES = 3

SEEN = 0
NEW = 0
SKIPPED_INACTIVE = 0
SKIPPED_NO_NAME = 0
SUBQUERIES = 0


def load_env() -> None:
    try:
        with open(ENV_FILE) as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                if k and not os.environ.get(k):
                    os.environ[k] = v
    except FileNotFoundError:
        pass  # env vars may already be set


def orgbook_get(params: dict) -> dict:
    """One OrgBook call with pacing + backoff. Returns parsed JSON."""
    global SUBQUERIES
    url = ORGBOOK_BASE + "?" + urllib.parse.urlencode(params)
    for attempt in range(1, RETRIES + 1):
        time.sleep(PACING)
        try:
            with urllib.request.urlopen(url, timeout=30) as r:
                SUBQUERIES += 1
                return json.loads(r.read().decode())
        except urllib.error.HTTPError as e:
            if e.code == 400:
                # Cap hit (or empty) — surface as None so the caller subdivides
                return {"total": 0, "results": [], "_cap_hit": True}
            if e.code in (429, 500, 502, 503) and attempt < RETRIES:
                time.sleep(2 ** attempt * 2)
                continue
            print(f"  ! HTTP {e.code} on {url[:120]}", file=sys.stderr)
            return {"total": 0, "results": []}
        except Exception as e:  # noqa: BLE001
            if attempt < RETRIES:
                time.sleep(2 ** attempt * 2)
                continue
            print(f"  ! request failed on {url[:120]}: {e}", file=sys.stderr)
            return {"total": 0, "results": []}
    return {"total": 0, "results": []}


def sb_upsert(rows: list) -> None:
    """Batch upsert into company_leads — insert-only, existing rows untouched."""
    global NEW
    if not rows:
        return
    url = f"{os.environ['SUPABASE_URL']}/rest/v1/company_leads?on_conflict=source,registration_id"
    req = urllib.request.Request(
        url,
        data=json.dumps(rows).encode(),
        method="POST",
        headers={
            "Authorization": f"Bearer {os.environ['SUPABASE_SERVICE_ROLE_KEY']}",
            "apikey": os.environ["SUPABASE_SERVICE_ROLE_KEY"],
            "Content-Type": "application/json",
            "Prefer": "resolution=ignore-duplicates,return=minimal",
        },
    )
    try:
        urllib.request.urlopen(req, timeout=30)
    except Exception as e:  # noqa: BLE001
        print(f"  ! supabase upsert failed: {e}", file=sys.stderr)
    NEW += len(rows)


def sb_save_state(next_url: str, result: str) -> None:
    """Write the resume cursor to company_lead_pull_state (migration 131)."""
    import datetime
    payload = [{
        "id": 1,
        "keyword_index": 0,
        "next_url": next_url,
        "last_run_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "last_result": result,
    }]
    url = f"{os.environ['SUPABASE_URL']}/rest/v1/company_lead_pull_state?on_conflict=id"
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        method="POST",
        headers={
            "Authorization": f"Bearer {os.environ['SUPABASE_SERVICE_ROLE_KEY']}",
            "apikey": os.environ["SUPABASE_SERVICE_ROLE_KEY"],
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=minimal",
        },
    )
    try:
        urllib.request.urlopen(req, timeout=30)
    except Exception as e:  # noqa: BLE001
        print(f"  ! pull-state save failed: {e}", file=sys.stderr)


def entity_row(item: dict):
    """Map one OrgBook credential to a company_leads row (or None to skip)."""
    global SKIPPED_INACTIVE, SKIPPED_NO_NAME
    if item.get("inactive") is not False:
        SKIPPED_INACTIVE += 1
        return None
    attrs = {a.get("type"): a.get("value") for a in (item.get("attributes") or []) if a.get("type")}
    if attrs.get("entity_status") not in (None, "ACT"):
        SKIPPED_INACTIVE += 1
        return None
    names = item.get("names") or []
    legal = next((n.get("text") for n in names if n.get("type") == "legal_name"), None) \
        or (names[0].get("text") if names else None)
    if not legal:
        SKIPPED_NO_NAME += 1
        return None
    reg = next((n.get("text") for n in names if n.get("type") == "registration"), None) \
        or f"topic:{item.get('topic', {}).get('id') or item.get('id')}"
    return {
        "name": legal[:300],
        "source": "orgbook_bc",
        "registration_id": str(reg)[:120],
        "entity_status": attrs.get("entity_status"),
        "entity_type": attrs.get("entity_type"),
        "matched_keyword": None,
        "industry_guess": None,
        "province": "BC",
    }


def walk(prefix: str, depth: int, limit: int) -> bool:
    """Enumerate one prefix; subdivide when the cap is hit. Returns True when
    the prefix is fully covered (nothing left to subdivide)."""
    global SEEN
    data = orgbook_get({"q": prefix, "format": "json", "page": 1})
    total = data.get("total", 0)
    if total == 0:
        return True
    if total > CAP and depth < MAX_DEPTH:
        print(f"[{prefix or '*'}*] total={total} > cap — subdividing")
        done = True
        for ch in CHARS:
            if not walk(prefix + ch, depth + 1, limit):
                done = False
            if limit and NEW >= limit:
                return False
        return done

    # Fits in the cap — walk its pages
    pages = min((total + PAGE_SIZE - 1) // PAGE_SIZE, CAP // PAGE_SIZE)
    print(f"[{prefix}] total={total} — walking {pages} page(s)")
    buffer = []
    for page in range(1, pages + 1):
        data = orgbook_get({"q": prefix, "format": "json", "page": page})
        results = data.get("results") or []
        for item in results:
            SEEN += 1
            row = entity_row(item)
            if row:
                buffer.append(row)
                if len(buffer) >= BATCH:
                    sb_upsert(buffer)
                    buffer = []
                    print(f"  … upserted, total new so far={NEW} (seen {SEEN})")
                    if limit and NEW >= limit:
                        return False
    if buffer:
        sb_upsert(buffer)
    return True


def main() -> None:
    global NEW
    load_env()
    for var in ("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"):
        if not os.environ.get(var):
            print(f"✗ {var} not set (expected in {ENV_FILE})", file=sys.stderr)
            sys.exit(1)

    args = sys.argv[1:]
    start_prefix = ""
    limit = 0
    if "--prefix=" in " ".join(args):
        start_prefix = next(a.split("=", 1)[1] for a in args if a.startswith("--prefix="))
    if "--limit=" in " ".join(args):
        limit = int(next(a.split("=", 1)[1] for a in args if a.startswith("--limit=")))

    started = time.time()
    print(f"OrgBook BC full-registry pull starting (from prefix {start_prefix!r}, "
          f"limit={limit or 'none'}) at {time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}")

    completed = True
    if start_prefix:
        # Resume: finish the given prefix's subtree, then continue with the rest
        completed = walk(start_prefix, len(start_prefix), limit)
    if (not limit or NEW < limit) and completed:
        # Walk the top-level prefixes that haven't been covered yet
        for ch in CHARS:
            if start_prefix and ch < start_prefix[0]:
                continue
            if start_prefix and ch == start_prefix[0]:
                continue  # already handled by the resume above
            if not walk(ch, 1, limit):
                completed = False
            if limit and NEW >= limit:
                break
            sb_save_state(f"prefix:{ch}", f"done prefix {ch}; {NEW} new rows")

    mins = (time.time() - started) / 60
    print(f"Done in {mins:.1f}m — seen={SEEN}, new={NEW}, "
          f"skipped_inactive={SKIPPED_INACTIVE}, skipped_no_name={SKIPPED_NO_NAME}, "
          f"orgbook_queries={SUBQUERIES}")
    sb_save_state("", f"run finished; {NEW} new rows in {mins:.1f}m")


if __name__ == "__main__":
    main()
