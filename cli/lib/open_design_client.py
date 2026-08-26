"""open_design_client.py — Stage 2's "live tier" (docs/PRD-design-first-
workflow.md, master tree F2a): a thin, honest client for the nexu-io/
open-design daemon deployed by vps-scripts/deploy-open-design.sh.

Verified against a real clone of the daemon's source before writing this
(not guessed): the daemon exposes `GET /api/design-systems` (and
`/api/design-systems/:id`) over plain HTTP, auth'd with `OD_API_TOKEN` as a
bearer token when the deploy script's default (auth ON) is used. Response
shape per entry mirrors the repo's own `design-systems/<id>/manifest.json`
— `id`, `name`, `category`, `description` at minimum.

Same LIVE/degrade discipline as screenshot_to_code_client.py: no daemon
configured (OPEN_DESIGN_URL unset) or unreachable within the timeout ->
honest degrade to curated-only, never a silent empty list mistaken for
"no live entries exist". Every degrade path returns a warning string, same
convention as dashboard_credentials.py / GenerateResult.warnings.
"""
from __future__ import annotations
import json
import os
import urllib.error
import urllib.request


def _base_url() -> str:
    return os.environ.get("OPEN_DESIGN_URL", "").rstrip("/")


def is_configured() -> bool:
    return bool(_base_url())


def fetch_live_design_systems(timeout: float = 5.0) -> tuple[list[dict], list[str]]:
    """F2a — live tier reachable? Returns (entries, warnings). Never raises;
    an empty list + a warning means "couldn't reach it", not "it has zero
    entries" — callers should degrade to curated-only on any warning, not
    just on an exception."""
    base = _base_url()
    if not base:
        return [], ["OPEN_DESIGN_URL not set — Stage 2 degrading to curated tier only (F2a)."]

    token = os.environ.get("OD_API_TOKEN", "")
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    req = urllib.request.Request(f"{base}/api/design-systems", headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as e:
        return [], [f"open-design daemon at {base} unreachable ({e}) — Stage 2 degrading to curated tier only (F2a)."]

    entries = data.get("designSystems", data) if isinstance(data, dict) else data
    if not isinstance(entries, list):
        return [], [f"open-design daemon at {base} returned an unexpected shape — Stage 2 degrading to curated tier only (F2a)."]

    out = []
    for e in entries:
        if not isinstance(e, dict) or not e.get("id"):
            continue
        out.append({
            "id": e["id"],
            "name": e.get("name", e["id"]),
            "category": e.get("category", "unknown"),
            "tier": "live",
            "license": e.get("license", "Apache-2.0"),  # the bundled catalog itself is Apache-2.0 (repo LICENSE);
                                                          # per-entry override only if the daemon reports one
        })
    return out, []


def verify_live_entry_exists(ref_id: str, timeout: float = 5.0) -> tuple[bool, list[str]]:
    """F2e re-check at selection time — a fresh call, not a cached list
    lookup, since the whole point of F2e is "did it change since we first
    showed the list"."""
    base = _base_url()
    if not base:
        return False, ["open-design not configured — can't re-verify a live-tier pick."]
    token = os.environ.get("OD_API_TOKEN", "")
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    req = urllib.request.Request(f"{base}/api/design-systems/{ref_id}", headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            if resp.status == 200:
                return True, []
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return False, []
        return False, [f"open-design daemon returned {e.code} re-verifying {ref_id!r} — treating as unavailable."]
    except (urllib.error.URLError, TimeoutError) as e:
        return False, [f"couldn't reach open-design to re-verify {ref_id!r} ({e}) — treating as unavailable."]
    return False, []
