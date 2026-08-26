#!/usr/bin/env python3
# fetch-hiring-bc.py — live hiring fetch, 3x daily (morning / evening / night).
#
# WHY THIS EXISTS (2026-08-25): the Companies page's "Hiring now" section was
# empty for BC because Adzuna — the ONLY Canada-province source — silently
# no-ops without its API key (adzuna.ts: "if (!appId || !appKey) return []").
# The other sources (RemoteOK, Remotive, Arbeitnow, freehire, Greenhouse) are
# remote-first/global and carry no BC locations. This fetcher runs the same
# integrations the dashboard's Discover uses, but on the VPS, on a schedule:
#
#   Adzuna    — the BC source: all 5 industries × "British Columbia",
#               app_id/app_key read LIVE from job_hunt_source_keys (set them
#               once in Settings → the Discover page's "set up Adzuna key";
#               free at developer.adzuna.com, 1,000 calls/month).
#   RemoteOK  — remote volume (location "Remote", marked remote=true).
#   Remotive  — remote volume.
#
# Results upsert into job_postings with dedup (UNIQUE source, external_id),
# status 'discovered' — the same table the Companies page's hiring list reads.
# LinkedIn/Indeed/Glassdoor are deliberately NOT scraped (ToS; both reference
# repos flag this, and the operator's zero-ban-risk rule stands).
#
# Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — from
# /root/.yvon-supabase.env (the clean source of truth).
#
# Cron (VPS, UTC — local Vancouver times in parentheses):
#   0 15 * * *  python3 -u fetch-hiring-bc.py   # 8am PT morning
#   0 1  * * *  python3 -u fetch-hiring-bc.py   # 6pm PT evening
#   0 6  * * *  python3 -u fetch-hiring-bc.py   # 11pm PT night
# Logs: /var/log/yvon-hiring/main.log

import json
import os
import sys
import time
import urllib.parse
import urllib.request

ENV_FILE = os.environ.get("YVON_SUPABASE_ENV", "/root/.yvon-supabase.env")
PACING = 0.6  # seconds between calls — public free APIs, be polite
UA = "Mozilla/5.0 (compatible; YVON-JobHunt/1.0)"

INDUSTRIES = {
    "Aerospace": {"category": "engineering-jobs", "keywords": "aerospace OR aircraft OR aviation OR aeronautics"},
    "IT": {"category": "it-jobs", "keywords": "software OR developer OR engineer"},
    "Trucking": {"category": "logistics-warehouse-jobs", "keywords": "truck OR dispatch OR logistics OR freight"},
    "Drone": {"category": "engineering-jobs", "keywords": "drone OR UAV OR unmanned aerial"},
    "Business": {"category": "management-jobs", "keywords": "MBA OR business OR operations OR management"},
}
BC_WHERE = "British Columbia"
ADZUNA_PAGES = 2
ADZUNA_PER_PAGE = 25
REMOTE_LIMIT = 50

TOTAL_NEW = 0
TOTAL_SEEN = 0

# BC relevance (2026-08-25): Adzuna's "British Columbia" query returns a few
# non-BC strays (Toronto etc.) — filter them before they reach the DB. Same
# rule as fetch-hiring-boards.py.
BC_TERMS = ["bc", "british columbia", "canada", "remote"]
BC_CITIES = ["vancouver", "victoria", "burnaby", "surrey", "richmond", "kelowna", "kamloops",
             "abbotsford", "nanaimo", "prince george", "penticton", "vernon", "cranbrook",
             "dawson creek", "terrace", "whistler", "squamish", "coquitlam", "langley",
             "maple ridge", "new westminster", "delta", "chilliwack", "mission", "courtenay",
             "comox", "campbell river", "fort st john", "quesnel", "williams lake", "salmon arm",
             "nelson", "trail", "golden", "revelstoke", "grand forks", "north vancouver"]


def bc_relevant(loc):
    l = (loc or "").lower()
    if not l:
        return False
    if any(t in l for t in BC_TERMS):
        return True
    return any(c in l for c in BC_CITIES)


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


def http_get(url: str, headers: dict | None = None) -> dict | list | None:
    global TOTAL_SEEN
    time.sleep(PACING)
    try:
        req = urllib.request.Request(url, headers=headers or {"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=30) as r:
            data = json.loads(r.read().decode())
        TOTAL_SEEN += 1
        return data
    except Exception as e:  # noqa: BLE001
        print(f"  ! fetch failed: {url[:100]}: {e}", file=sys.stderr)
        return None


def upsert(rows: list) -> None:
    global TOTAL_NEW
    if not rows:
        return
    res = rest("job_postings", query={"on_conflict": "source,external_id"}, payload=rows,
               prefer="resolution=ignore-duplicates,return=minimal")
    if res is not None:
        TOTAL_NEW += len(rows)


def fetch_adzuna(app_id: str, app_key: str) -> int:
    if not app_id or not app_key:
        print("  Adzuna NOT configured — set the free key on the Discover page (developer.adzuna.com). "
              "This is THE BC source; without it, BC hiring stays empty.")
        return 0
    total = 0
    for industry, spec in INDUSTRIES.items():
        for page in range(1, ADZUNA_PAGES + 1):
            params = {
                "app_id": app_id, "app_key": app_key,
                "results_per_page": str(ADZUNA_PER_PAGE),
                "content-type": "application/json",
                "sort_by": "date",
                "what": spec["keywords"],
                "where": BC_WHERE,
                "category": spec["category"],
            }
            url = f"https://api.adzuna.com/v1/api/jobs/ca/search/{page}?" + urllib.parse.urlencode(params)
            data = http_get(url)
            if not isinstance(data, dict) or not data.get("results"):
                continue
            rows = []
            dropped = 0
            for j in data["results"]:
                ext = j.get("id") or j.get("redirect_url")
                if not ext:
                    continue
                loc = (j.get("location") or {}).get("display_name") or (j.get("location") or {}).get("area")
                loc = loc if isinstance(loc, str) else (", ".join(loc[-2:]) if isinstance(loc, list) and loc else None)
                if not bc_relevant(loc):
                    dropped += 1
                    continue
                rows.append({
                    "source": "adzuna",
                    "external_id": str(ext),
                    "title": j.get("title") or "Untitled role",
                    "company": (j.get("company") or {}).get("display_name") or "Unknown company",
                    "location": loc,
                    "remote": "remote" in (j.get("title") or "").lower(),
                    "url": j.get("redirect_url") or "",
                    "description": j.get("description"),
                    "salary_min": j.get("salary_min"),
                    "salary_max": j.get("salary_max"),
                    "salary_currency": "CAD" if (j.get("salary_min") or j.get("salary_max")) else None,
                    "posted_at": j.get("created"),
                    "raw": j,
                    "status": "discovered",
                })
            if dropped:
                print(f"  adzuna/{industry} p{page}: filtered {dropped} non-BC")
            upsert(rows)
            total += len(rows)
            print(f"  adzuna/{industry} p{page}: {len(rows)} postings")
    return total


def fetch_remoteok() -> int:
    data = http_get("https://remoteok.com/api")
    if not isinstance(data, list) or len(data) < 2:
        return 0
    rows = []
    for j in data[1:]:  # skip the legal-notice entry
        ext = j.get("id") or j.get("slug") or j.get("url")
        if not ext:
            continue
        rows.append({
            "source": "remoteok",
            "external_id": str(ext),
            "title": j.get("position") or "Untitled role",
            "company": j.get("company") or "Unknown company",
            "location": j.get("location") or "Remote",
            "remote": True,
            "url": j.get("url") or "",
            "description": j.get("description"),
            "salary_min": j.get("salary_min"),
            "salary_max": j.get("salary_max"),
            "salary_currency": "USD" if (j.get("salary_min") or j.get("salary_max")) else None,
            "posted_at": j.get("date"),
            "raw": j,
            "status": "discovered",
        })
        if len(rows) >= REMOTE_LIMIT:
            break
    upsert(rows)
    print(f"  remoteok: {len(rows)} postings")
    return len(rows)


def fetch_remotive() -> int:
    data = http_get("https://remotive.com/api/remote-jobs?limit=50")
    if not isinstance(data, dict):
        return 0
    rows = []
    for j in (data.get("jobs") or []):
        ext = j.get("id") or j.get("url")
        if not ext:
            continue
        rows.append({
            "source": "remotive",
            "external_id": str(ext),
            "title": j.get("title") or "Untitled role",
            "company": j.get("company_name") or "Unknown company",
            "location": j.get("candidate_required_location") or "Remote",
            "remote": True,
            "url": j.get("url") or "",
            "description": j.get("description"),
            "salary_min": None,
            "salary_max": None,
            "salary_currency": None,
            "posted_at": j.get("publication_date"),
            "raw": j,
            "status": "discovered",
        })
    upsert(rows)
    print(f"  remotive: {len(rows)} postings")
    return len(rows)


def main() -> None:
    load_env()
    for var in ("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"):
        if not os.environ.get(var):
            print(f"✗ {var} not set (expected in {ENV_FILE})", file=sys.stderr)
            sys.exit(1)

    started = time.time()
    print(f"Hiring fetch starting at {time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}")

    # Adzuna credentials: env file first (ADZUNA_APP_ID / ADZUNA_APP_KEY),
    # then job_hunt_source_keys (the Discover page's "set up Adzuna key").
    # BOTH are needed — the app_key alone (32 hex chars) isn't enough.
    config = {
        "app_id": os.environ.get("ADZUNA_APP_ID") or "",
        "app_key": os.environ.get("ADZUNA_APP_KEY") or "",
    }
    if not config["app_key"]:
        keys = rest("job_hunt_source_keys", query={"select": "config", "source": "eq.adzuna"})
        if isinstance(keys, list) and keys and isinstance(keys[0], dict):
            config = keys[0].get("config") or {}

    n_adzuna = fetch_adzuna(str(config.get("app_id") or ""), str(config.get("app_key") or ""))
    n_remoteok = fetch_remoteok()
    n_remotive = fetch_remotive()

    mins = (time.time() - started) / 60
    print(f"Done in {mins:.1f}m — adzuna={n_adzuna} remoteok={n_remoteok} remotive={n_remotive} "
          f"(new/updated rows upserted={TOTAL_NEW}, api_calls={TOTAL_SEEN})")


if __name__ == "__main__":
    main()
