#!/usr/bin/env python3
# fetch-hiring-boards.py — Indeed + LinkedIn live hiring fetch (2026-08-25).
#
# RULE CHANGE (operator override, 2026-08-25): the zero-ban-risk rule that
# excluded LinkedIn/Indeed (recorded in migrations/122_job_hunt_discovery.sql)
# is explicitly overridden. This script pulls BOTH boards, with guardrails:
#   · public/guest data only — NO login automation, NO account cookies passed
#   · CAPTCHA / anti-bot block → log and skip gracefully, never retry hard
#   · rate-limited (sleep between queries), dry-run available
#   · same dedup + status='discovered' pipeline as every other source
#
# Implementation: python-jobspy — the same maintained MIT-licensed library
# ApplyPilot uses for board discovery (pip install python-jobspy). It handles
# the per-board parsing nuances; we handle normalization + upsert.
#
# Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — from
# /root/.yvon-supabase.env. Also ADZUNA_APP_ID/ADZUNA_APP_KEY there if you
# want this script to run the Adzuna leg too (see fetch-hiring-bc.py).
#
# Usage:
#   python3 fetch-hiring-boards.py                    # Indeed + LinkedIn, BC, all industries
#   python3 fetch-hiring-boards.py --site indeed      # one board only
#   python3 fetch-hiring-boards.py --site linkedin    # the other
#   python3 fetch-hiring-boards.py --dry-run          # fetch + print counts, no DB writes
#
# Cron (VPS, UTC — Vancouver times in parentheses), same cadence as the BC fetcher:
#   0 15 * * *  python3 -u fetch-hiring-boards.py   # 8am PT morning
#   0 1  * * *  python3 -u fetch-hiring-boards.py   # 6pm PT evening
#   0 6  * * *  python3 -u fetch-hiring-boards.py   # 11pm PT night

import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

ENV_FILE = os.environ.get("YVON_SUPABASE_ENV", "/root/.yvon-supabase.env")
BC_LOCATION = "British Columbia, Canada"
# 2026-08-25 breadth fix: MULTIPLE short queries per industry (the 125-vs-500
# problem — one OR-query per industry caps volume hard; short queries surface
# distinct postings).
# 2026-08-25 config-as-data: the real industry/keyword lists live in the
# job_hunt_sync_queries table (migration 132), edited from the Discover page.
# This script READS the table at run time via Supabase REST — changing a
# sector in Discover propagates to the 3x daily runs with no code edit.
DEFAULT_QUERIES = {
    "Aerospace": ["aerospace engineer", "aircraft maintenance", "aviation", "aeronautics"],
    "IT": ["software engineer", "full stack developer", "machine learning", "data engineer", "backend developer"],
    "Trucking": ["truck driver", "dispatcher", "logistics coordinator", "freight"],
    "Drone": ["drone operator", "UAV", "unmanned aerial", "robotics engineer"],
    "Business": ["business analyst", "operations manager", "project manager", "account manager"],
}
RESULTS_PER_QUERY = 100  # 2026-08-25: depth raised — volume is the ask; jobspy pages internally
# 2026-08-25: --days=N deep mode — pull N days back (default 60 when set),
# raising results per query so jobspy pages deeper into history, and
# dropping anything posted before the cutoff.
DEEP_DAYS = 60
DEEP_RESULTS_PER_QUERY = 300
SLEEP_BETWEEN = 4  # seconds — public boards, be polite
# BC relevance filter (2026-08-25 v2, STRICT) — boards can return non-BC
# matches (US on-site postings from Indeed's "similar" results). Same rule as
# the dashboard's lib/job-hunt/bc-filter.ts v2: a posting passes ONLY if its
# location names BC/Canada/a BC city — or the location is purely remote
# (no foreign city). The remote FLAG alone is NOT enough: a US city marked
# remote is still US and gets dropped.
BC_TERMS = ["bc", "british columbia", "canada"]
REMOTE_TERMS = ["remote", "anywhere", "worldwide", "work from home"]
BC_CITIES = ["vancouver", "victoria", "burnaby", "surrey", "richmond", "kelowna", "kamloops",
             "abbotsford", "nanaimo", "prince george", "penticton", "vernon", "cranbrook",
             "dawson creek", "terrace", "whistler", "squamish", "coquitlam", "langley",
             "maple ridge", "new westminster", "delta", "chilliwack", "mission", "courtenay",
             "comox", "campbell river", "fort st john", "quesnel", "williams lake", "salmon arm",
             "nelson", "trail", "golden", "revelstoke", "grand forks", "north vancouver"]


def bc_relevant(loc, remote):
    l = (loc or "").lower().strip()
    if not l:
        return False
    if any(t in l for t in BC_TERMS):
        return True
    if any(c in l for c in BC_CITIES):
        return True
    # pure-remote location (no city): "Remote", "Anywhere", "🌏 Remote"
    if any(t in l for t in REMOTE_TERMS):
        rest = re.sub("|".join(re.escape(t) for t in REMOTE_TERMS), "", l).strip()
        rest = re.sub(r"[^a-z ]", "", rest).strip()
        if not rest:
            return True
    return False


DRY_RUN = "--dry-run" in sys.argv[1:]
SITE_ONLY = ""
if "--site=" in " ".join(sys.argv[1:]):
    SITE_ONLY = next(a.split("=", 1)[1] for a in sys.argv[1:] if a.startswith("--site="))
elif "--site" in sys.argv:
    SITE_ONLY = sys.argv[sys.argv.index("--site") + 1] if len(sys.argv) > sys.argv.index("--site") + 1 else ""
DEEP = "--days" in sys.argv
CUTOFF_ISO = None
if DEEP:
    import datetime as _dt
    days = 60
    if "--days=" in " ".join(sys.argv[1:]):
        days = int(next(a.split("=", 1)[1] for a in sys.argv[1:] if a.startswith("--days=")))
    CUTOFF_ISO = (_dt.datetime.now(_dt.timezone.utc) - _dt.timedelta(days=days)).isoformat()
    # jobspy returns posted_at as datetime.date (or datetime) — compare like
    # for like so `'date' >= 'str'` never raises. String form (ISO date) kept
    # for the posted_at text comparison.
    CUTOFF_DATE = (_dt.datetime.now(_dt.timezone.utc) - _dt.timedelta(days=days)).date()

TOTAL_NEW = 0


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
        pass


def rest(path: str, query: dict | None = None, payload: list | None = None, prefer: str | None = None) -> dict:
    url = f"{os.environ['SUPABASE_URL']}/rest/v1/{path}"
    if query:
        url += "?" + urllib.parse.urlencode(query)
    headers = {
        "Authorization": f"Bearer {os.environ['SUPABASE_SERVICE_ROLE_KEY']}",
        "apikey": os.environ["SUPABASE_SERVICE_ROLE_KEY"],
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer
    req = urllib.request.Request(url, data=json.dumps(payload).encode() if payload else None, headers=headers,
                                 method="POST" if payload else "GET")
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode() or "null")
    except Exception as e:  # noqa: BLE001
        print(f"  ! supabase {path} failed: {e}", file=sys.stderr)
        return {}


def upsert(rows: list) -> None:
    global TOTAL_NEW
    if not rows:
        return
    if DRY_RUN:
        print(f"  [dry-run] would upsert {len(rows)} rows")
        TOTAL_NEW += len(rows)
        return
    res = rest("job_postings", query={"on_conflict": "source,external_id"}, payload=rows,
               prefer="resolution=ignore-duplicates,return=minimal")
    if res is not None:
        TOTAL_NEW += len(rows)


def to_row(r, site: str) -> dict | None:
    """Normalize one jobspy result row (dict from pandas row) to a posting."""
    ext = r.get("id")
    if not ext:
        ext = r.get("job_url") or r.get("title")
    if not ext:
        return None
    return {
        "source": site,
        "external_id": f"{site}:{ext}",
        "title": r.get("title") or "Untitled role",
        "company": r.get("company") or "Unknown company",
        "location": r.get("location") or (BC_LOCATION if site == "indeed" else None),
        "remote": bool(r.get("remote")),
        "url": r.get("job_url") or "",
        "description": r.get("description"),
        "salary_min": r.get("salary_min"),
        "salary_max": r.get("salary_max"),
        "salary_currency": r.get("salary_currency") or ("CAD" if site == "indeed" else None),
        "posted_at": r.get("date_posted"),
        "raw": {k: (str(v) if k == "job_url" else v) for k, v in (r or {}).items() if v is not None},
        "status": "discovered",
    }


def main() -> None:
    load_env()
    for var in ("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"):
        if not os.environ.get(var):
            print(f"✗ {var} not set (expected in {ENV_FILE})", file=sys.stderr)
            sys.exit(1)

    try:
        from jobspy import scrape_jobs
    except ImportError:
        print("✗ python-jobspy not installed — run: pip install python-jobspy", file=sys.stderr)
        sys.exit(1)

    started = time.time()
    print(f"Indeed+LinkedIn fetch starting at {time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())} "
          f"({DRY_RUN and 'dry-run' or 'live'})")

    # jobspy is a pandas-returning library; we convert defensively.
    import pandas as pd

    total = 0
    sites = [SITE_ONLY] if SITE_ONLY in ("indeed", "linkedin") else ["indeed", "linkedin"]

    # Config from the DB (editable in Discover); defaults only as fallback.
    industry_queries = DEFAULT_QUERIES
    try:
        rows = rest("job_hunt_sync_queries", query={"select": "industry,queries,enabled"})
        if isinstance(rows, list) and rows:
            industry_queries = {
                r["industry"]: r.get("queries") or []
                for r in rows
                if r.get("enabled", True) is not False and r.get("queries")
            } or DEFAULT_QUERIES
            print(f"  using config from DB ({len(industry_queries)} industries)")
    except Exception as e:  # noqa: BLE001
        print(f"  ! config read failed, using defaults: {e}", file=sys.stderr)

    for site in sites:
        for industry, queries in industry_queries.items():
            for q in queries:
                time.sleep(SLEEP_BETWEEN)
                try:
                    kwargs = {
                        "site_name": [site],
                        "search_term": q,
                        "location": BC_LOCATION,
                        "results_wanted": DEEP_RESULTS_PER_QUERY if DEEP else RESULTS_PER_QUERY,
                    }
                    if site == "indeed":
                        kwargs["country_indeed"] = "Canada"
                    df = scrape_jobs(**kwargs)
                    if df is None or df.empty:
                        print(f"  {site} '{q}': 0 results (blocked or none)")
                        continue
                    rows = []
                    for _, r in df.iterrows():
                        row = to_row(r.to_dict(), site)
                        if row:
                            rows.append(row)
                    if CUTOFF_ISO is not None:
                        cutoff_dt = _dt.datetime.now(_dt.timezone.utc) - _dt.timedelta(days=60)
                        keep = []
                        for r in rows:
                            pa = r.get("posted_at")
                            if not pa:
                                keep.append(r)
                                continue
                            if isinstance(pa, _dt.datetime):
                                if pa >= cutoff_dt:
                                    keep.append(r)
                            elif isinstance(pa, _dt.date):
                                if pa >= CUTOFF_DATE:
                                    keep.append(r)
                            elif isinstance(pa, str):
                                if pa >= CUTOFF_ISO:
                                    keep.append(r)
                            else:
                                keep.append(r)
                        rows = keep
                    kept = [r for r in rows if bc_relevant(r.get("location"), r.get("remote"))]
                    if len(kept) != len(rows):
                        print(f"  {site} '{q}': filtered {len(rows) - len(kept)} non-BC")
                    upsert(kept)
                    total += len(kept)
                    print(f"  {site} '{q}': {len(kept)} postings")
                except Exception as e:  # noqa: BLE001 — a block degrades one query, not the run
                    print(f"  {site} '{q}': skipped — {str(e)[:140]}")

    mins = (time.time() - started) / 60
    print(f"Done in {mins:.1f}m — boards total={total} (upserted={TOTAL_NEW})")


if __name__ == "__main__":
    main()
