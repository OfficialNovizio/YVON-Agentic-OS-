"""dashboard_credentials.py — reads the dashboard's own active LLM provider
key from Supabase (dashboard/lib/ai-client.ts's `ai_provider_keys` table), so
cli/design.py doesn't need its own separate copy of API keys when the
operator has already configured one in the dashboard's Project Settings.

Same SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env-var convention already used
by this repo's other standalone Python scripts (vps-scripts/yvon-hermes-http/
events.py's own header: "Config (env, set in the systemd unit — never
committed)") — NOT auto-loaded from dashboard/.env.local, a Next.js-only file
Python scripts here have never read. Set these two explicitly wherever this
script runs, same discipline events.py already documents.

`ai_provider_keys` holds exactly ONE active row (provider, api_key, base_url)
— the dashboard's whole agent system's single configured model, not a
per-provider vault. screenshot-to-code wants up to four separate named keys
(openAiApiKey/anthropicApiKey/geminiApiKey/replicateApiKey), since it can mix
providers per generation (backend/README.md: "Adding all four keys gives the
best results"). This module maps that one active row to whichever of those
four fields it actually corresponds to: by provider name for 'anthropic';
for 'custom' (dashboard/lib/providers.ts types this uniformly as protocol
'openai-compat' regardless of host — DeepSeek, Groq, a proxy, a local
server, all called the OpenAI-SDK-shaped way there), by base_url host for
the two cases that are a genuinely different provider under the hood
(api.openai.com -> openAiApiKey plain, the Gemini host -> geminiApiKey),
falling through to openAiApiKey + openAiBaseURL for everything else —
screenshot-to-code's own openai_base_url override exists for exactly this.
Only a 'custom' row with no base_url at all, or an unrecognized provider
value, is genuinely unmapped — and this says so rather than guessing.
"""
from __future__ import annotations
import json
import os
import urllib.error
import urllib.request

# base_url host substring -> screenshot-to-code params field. Only hosts that
# actually correspond to one of screenshot-to-code's four provider fields;
# see dashboard/lib/providers.ts's KNOWN_ENDPOINTS for the fuller list this
# is a deliberate subset of (DeepSeek/Groq/Together/MiniMax/Mistral/Ollama/
# LM Studio have no screenshot-to-code equivalent — reported as unmapped).
_HOST_TO_FIELD = {
    "api.openai.com": "openAiApiKey",
    "generativelanguage.googleapis.com": "geminiApiKey",
}


def fetch_active_provider_key(timeout: float = 10.0) -> tuple[dict, list[str]]:
    """Returns (fields, warnings). `fields` is a subset of {openAiApiKey,
    anthropicApiKey, geminiApiKey, openAiBaseURL} — never replicateApiKey,
    ai_provider_keys has no concept of that (Replicate isn't a chat/agent
    provider). Empty dict + a warning explaining why on anything short of a
    clean, mapped hit — never raises, this is a best-effort convenience on
    top of the explicit-env-var path, not a hard dependency."""
    url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not (url and key):
        return {}, [
            "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — skipping the dashboard's "
            "Project Settings key, falling back to this process's own OPENAI_API_KEY/etc. "
            "(or the screenshot-to-code server's own backend/.env)."
        ]

    endpoint = (
        f"{url}/rest/v1/ai_provider_keys"
        "?select=provider,api_key,base_url"
        "&is_active=eq.true"
        "&order=updated_at.desc"
        "&limit=1"
    )
    req = urllib.request.Request(endpoint, headers={"apikey": key, "Authorization": f"Bearer {key}"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            rows = json.loads(resp.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as e:
        return {}, [
            f"couldn't reach Supabase's ai_provider_keys ({e}) — falling back to this process's "
            f"own env vars / the server's backend/.env."
        ]

    if not rows:
        return {}, [
            "ai_provider_keys has no active row in Supabase (dashboard/lib/ai-client.ts's own env "
            "fallback would apply there too) — falling back to this process's own env vars / the "
            "server's backend/.env."
        ]

    row = rows[0]
    provider = row.get("provider")
    api_key = row.get("api_key")
    base_url = (row.get("base_url") or "").lower()
    if not api_key:
        return {}, [f"active ai_provider_keys row (provider={provider!r}) has no api_key set"]

    if provider == "anthropic":
        return {"anthropicApiKey": api_key}, []

    if provider == "custom":
        if not base_url:
            # providers.ts's own 'custom' entry: baseUrl: '' // user must supply.
            # No base_url at all means genuinely nothing to point screenshot-to-code
            # at — can't assume it's OpenAI's default endpoint from an empty value.
            return {}, [
                "active ai_provider_keys row is a custom/openai-compat provider with no base_url "
                "set — nothing to map to any screenshot-to-code field. Falling back to this "
                "process's own env vars / the server's backend/.env for generation."
            ]
        for host, field in _HOST_TO_FIELD.items():
            if host in base_url:
                fields = {field: api_key}
                if field == "openAiApiKey" and "api.openai.com" not in base_url:
                    fields["openAiBaseURL"] = row.get("base_url")
                return fields, []
        # Any other custom endpoint: dashboard/lib/providers.ts types 'custom' as
        # uniformly protocol: 'openai-compat' regardless of host (DeepSeek, Groq,
        # a local server, a proxy — all called the same OpenAI-SDK-shaped way
        # there). screenshot-to-code's own openAiApiKey+openAiBaseURL exists for
        # exactly this — routes/generate_code.py's openai_base_url field, "Disable
        # user-specified OpenAI Base URL in prod" — so this maps the same way,
        # not as an unmapped case.
        return {"openAiApiKey": api_key, "openAiBaseURL": row.get("base_url")}, []

    return {}, [
        f"active ai_provider_keys row has an unrecognized provider {provider!r} — falling back to "
        f"this process's own env vars / the server's backend/.env."
    ]
