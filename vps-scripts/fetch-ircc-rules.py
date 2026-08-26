#!/usr/bin/env python3
# fetch-ircc-rules.py — PR Intelligence: nightly IRCC rule fetch (2026-08-25).
#
# Uses Agent-Reach's web-reading path (Jina Reader — the zero-config reader
# Agent-Reach installs per its docs; Agent-Reach v1.5.0 itself has no `read`
# subcommand, verified 2026-08-26) to read the official IRCC/BC PNP pages and
# stores topic/text/source/fetched_at in ircc_rules (migration 133). The Job
# Hunt PR Insights section reads it. Informational only — every row carries
# its source URL + fetched date; never legal advice; rules change, dates make
# that visible.
#
# Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (/root/.yvon-supabase.env)
# Cron (weekly, 04:30 UTC Sunday):
#   30 4 * * 0 /opt/yvon-tools/venvs/agent-reach/bin/python3 -u /root/YVON-Agentic-OS-/vps-scripts/fetch-ircc-rules.py >> /var/log/yvon-hiring/ircc.log 2>&1

import json
import os
import sys
import urllib.request

ENV_FILE = os.environ.get("YVON_SUPABASE_ENV", "/root/.yvon-supabase.env")

# Official sources only — canada.ca (IRCC) and welcomebc.ca (BC PNP).
PAGES = [
    ("express-entry", "Express Entry", "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html"),
    ("crs", "CRS — Comprehensive Ranking System", "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/criteria-comprehensive-ranking-system/grid.html"),
    ("cec", "Canadian Experience Class", "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/canadian-experience-class.html"),
    ("noc-teer", "NOC / TEER classification", "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/choose-immigration-type.html"),
    ("bc-pnp", "BC PNP — Skills Immigration", "https://www.welcomebc.ca/Immigrate/Immigrate-to-B-C/BC-PNP/BC-PNP-Skills-Immigration"),
    ("work-permit", "Work permits", "https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/permit.html"),
]


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


def fetch(topic: str, title: str, url: str) -> str | None:
    """Jina Reader (r.jina.ai/<url>) → markdown text (bounded)."""
    try:
        req = urllib.request.Request(
            f"https://r.jina.ai/{url}",
            headers={"User-Agent": "Mozilla/5.0 (YVON IRCC fetch)", "Accept": "text/plain"},
        )
        with urllib.request.urlopen(req, timeout=120) as r:
            text = r.read().decode("utf-8", errors="replace").strip()
        if len(text) < 200:
            print(f"  {topic}: short/empty read ({len(text)} chars) — skipping", file=sys.stderr)
            return None
        return text[:20000]  # bound the stored body
    except Exception as e:  # noqa: BLE001
        print(f"  {topic}: fetch failed — {e}", file=sys.stderr)
        return None


def upsert(topic: str, title: str, url: str, body: str) -> None:
    payload = [{
        "topic": topic,
        "title": title,
        "body": body,
        "source_url": url,
        "fetched_at": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
    }]
    req = urllib.request.Request(
        f"{os.environ['SUPABASE_URL']}/rest/v1/ircc_rules?on_conflict=topic,source_url",
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
        print(f"  {topic}: upserted ({len(body)} chars)")
    except Exception as e:  # noqa: BLE001
        print(f"  {topic}: upsert failed — {e}", file=sys.stderr)


def main() -> None:
    load_env()
    for var in ("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"):
        if not os.environ.get(var):
            print(f"✗ {var} not set (expected in {ENV_FILE})", file=sys.stderr)
            sys.exit(1)

    print(f"IRCC rules fetch starting at {__import__('time').strftime('%Y-%m-%dT%H:%M:%SZ', __import__('time').gmtime())}")
    ok = 0
    for topic, title, url in PAGES:
        body = fetch(topic, title, url)
        if body:
            upsert(topic, title, url, body)
            ok += 1
    print(f"Done — {ok}/{len(PAGES)} rules refreshed")


if __name__ == "__main__":
    main()
