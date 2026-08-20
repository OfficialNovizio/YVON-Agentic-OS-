#!/usr/bin/env python3
"""test_dashboard_credentials.py — regression test for
cli/lib/dashboard_credentials.py's mapping of the dashboard's Supabase
ai_provider_keys active row onto screenshot-to-code's four provider-key
fields (docs/PRD-design-first-workflow.md).

Runs a local mock HTTP server (background thread) that returns canned
PostgREST-shaped JSON — never touches a real Supabase project. Plain
asserts + prints, no pytest dependency — same convention as the rest of
cli/*.py.

Usage: python3 cli/test_dashboard_credentials.py
"""
import json
import os
import sys
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib import dashboard_credentials as dc  # noqa: E402

PASS, FAIL = [], []


def check(name: str, cond: bool, detail: str = ""):
    if cond:
        PASS.append(name)
    else:
        FAIL.append(f"{name}  {detail}")


class MockSupabase:
    """Background HTTP server returning a fixed PostgREST-shaped response
    for any GET, regardless of query string (this module only ever sends
    one shape of request) — set .rows before each check to control it."""

    def __init__(self):
        self.rows = []
        outer = self

        class Handler(BaseHTTPRequestHandler):
            def do_GET(self):
                body = json.dumps(outer.rows).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)

            def log_message(self, *a):
                pass

        self._server = HTTPServer(("127.0.0.1", 0), Handler)
        self.port = self._server.server_port
        self._thread = threading.Thread(target=self._server.serve_forever, daemon=True)
        self._thread.start()

    def close(self):
        self._server.shutdown()
        self._thread.join(timeout=5)


def main() -> int:
    for var in ("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"):
        os.environ.pop(var, None)

    fields, warnings = dc.fetch_active_provider_key()
    check("unconfigured (no env vars) returns no fields", fields == {})
    check("unconfigured warns why", len(warnings) == 1 and "not set" in warnings[0], warnings)

    mock = MockSupabase()
    os.environ["SUPABASE_URL"] = f"http://127.0.0.1:{mock.port}"
    os.environ["SUPABASE_SERVICE_ROLE_KEY"] = "service-role-test-key"

    try:
        mock.rows = []
        fields, warnings = dc.fetch_active_provider_key()
        check("no active row returns no fields", fields == {})
        check("no active row warns why", len(warnings) == 1 and "no active row" in warnings[0], warnings)

        mock.rows = [{"provider": "anthropic", "api_key": "sk-ant-real", "base_url": None}]
        fields, warnings = dc.fetch_active_provider_key()
        check("anthropic provider maps to anthropicApiKey", fields == {"anthropicApiKey": "sk-ant-real"}, fields)
        check("clean anthropic mapping has no warnings", warnings == [], warnings)

        mock.rows = [{"provider": "custom", "api_key": "sk-oai-real", "base_url": "https://api.openai.com/v1"}]
        fields, warnings = dc.fetch_active_provider_key()
        check("custom + api.openai.com host maps to openAiApiKey", fields == {"openAiApiKey": "sk-oai-real"}, fields)

        mock.rows = [{"provider": "custom", "api_key": "sk-gem-real", "base_url": "https://generativelanguage.googleapis.com/v1beta"}]
        fields, warnings = dc.fetch_active_provider_key()
        check("custom + gemini host maps to geminiApiKey", fields == {"geminiApiKey": "sk-gem-real"}, fields)

        mock.rows = [{"provider": "custom", "api_key": "sk-oai-compat", "base_url": "https://my-openai-proxy.example.com/v1"}]
        fields, warnings = dc.fetch_active_provider_key()
        check(
            "custom + OpenAI-compatible-but-not-api.openai.com host maps to openAiApiKey + openAiBaseURL",
            fields == {"openAiApiKey": "sk-oai-compat", "openAiBaseURL": "https://my-openai-proxy.example.com/v1"},
            fields,
        )

        mock.rows = [{"provider": "custom", "api_key": "sk-deepseek", "base_url": "https://api.deepseek.com"}]
        fields, warnings = dc.fetch_active_provider_key()
        check(
            "custom + other openai-compat host (DeepSeek) maps to openAiApiKey + openAiBaseURL, not 'unmapped'",
            fields == {"openAiApiKey": "sk-deepseek", "openAiBaseURL": "https://api.deepseek.com"},
            fields,
        )

        mock.rows = [{"provider": "custom", "api_key": "sk-no-base", "base_url": None}]
        fields, warnings = dc.fetch_active_provider_key()
        check("custom with no base_url at all returns no fields (genuinely unmapped)", fields == {})
        check("custom with no base_url warns why", any("no base_url" in w for w in warnings), warnings)

        mock.rows = [{"provider": "anthropic", "api_key": None, "base_url": None}]
        fields, warnings = dc.fetch_active_provider_key()
        check("active row with no api_key returns no fields", fields == {})
        check("active row with no api_key warns why", any("no api_key" in w for w in warnings), warnings)

        mock.rows = [{"provider": "openrouter-legacy", "api_key": "sk-x", "base_url": None}]
        fields, warnings = dc.fetch_active_provider_key()
        check("unrecognized provider value returns no fields", fields == {})
        check("unrecognized provider value warns why", any("unrecognized provider" in w for w in warnings), warnings)

    finally:
        mock.close()

    os.environ["SUPABASE_URL"] = "http://127.0.0.1:1"  # nothing listening — connection refused
    fields, warnings = dc.fetch_active_provider_key(timeout=2.0)
    check("unreachable Supabase returns no fields", fields == {})
    check("unreachable Supabase warns why, doesn't raise", len(warnings) == 1 and "couldn't reach" in warnings[0], warnings)

    for var in ("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"):
        os.environ.pop(var, None)

    print(f"\n{len(PASS)} passed, {len(FAIL)} failed")
    for f in FAIL:
        print(f"  ✗ {f}")
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
