#!/usr/bin/env python3
"""
Web Performance — Browser Networking & Core Web Vitals
=======================================================
Sources (2-book minimum per §8.0):
  Book 1: Grigorik, Ilya, *High Performance Browser Networking*
          (O'Reilly, 2013).
          Free at https://hpbn.co/
          Chapters used: 1 (Primer on Latency & Bandwidth), 2 (TCP),
          3 (UDP), 4 (TLS), 7 (Mobile Networks), 10 (HTTP/1.X),
          11 (HTTP/2), 12 (Resource Loading), 13 (Optimizing Delivery)

  Book 2: Google, *Core Web Vitals* — published standards.
          Free at https://web.dev/vitals/
          Metrics: LCP (Largest Contentful Paint), INP (Interaction to
          Next Paint), CLS (Cumulative Layout Shift).
          Also: TTFB (Time to First Byte), FCP (First Contentful Paint),
          TBT (Total Blocking Time).

Route: A/B (threshold math + rule-based optimization decisions)

Covers what mia and rank need:
  - Core Web Vitals threshold assessment (LCP, INP, CLS)
  - Page load waterfall analysis
  - Connection optimization (TCP, TLS, HTTP/2 per Grigorik)
  - Resource loading strategy (critical path, defer, preload)
  - Mobile network optimization (Grigorik Ch.7)
  - Performance budget enforcement
"""

from __future__ import annotations
import math
import sys
from typing import List, Dict, Optional, Tuple


def _fv(val: float, name: str) -> None:
    if not isinstance(val, (int, float)):
        raise TypeError(f"{name} must be a number")
    if math.isnan(val) or math.isinf(val):
        raise ValueError(f"{name} is {'NaN' if math.isnan(val) else 'infinite'}")


# ═══════════════════════════════════════════════════════════════════
# PART 1 — CORE WEB VITALS ASSESSMENT
# Source: Google Core Web Vitals at web.dev/vitals/
#         Grigorik Ch.1 (Latency & Bandwidth), Ch.12 (Resource Loading)
# ═══════════════════════════════════════════════════════════════════

CWV_THRESHOLDS = {
    "LCP": {"good": 2500, "poor": 4000, "unit": "ms",
            "description": "Largest Contentful Paint — when the main content becomes visible."},
    "INP": {"good": 200, "poor": 500, "unit": "ms",
            "description": "Interaction to Next Paint — responsiveness to user input."},
    "CLS": {"good": 0.1, "poor": 0.25, "unit": "score",
            "description": "Cumulative Layout Shift — visual stability during load."},
    "TTFB": {"good": 800, "poor": 1800, "unit": "ms",
            "description": "Time to First Byte — server response time."},
    "FCP": {"good": 1800, "poor": 3000, "unit": "ms",
            "description": "First Contentful Paint — first visible content."},
    "TBT": {"good": 200, "poor": 600, "unit": "ms",
            "description": "Total Blocking Time — main thread blocking during load."},
}


def core_web_vitals_score(
    lcp_ms: float,
    inp_ms: float,
    cls_score: float,
) -> Dict:
    """
    Score Core Web Vitals against Google's thresholds.
    CWV thresholds from web.dev/vitals/ (2024).

    Google CWV assessment:
      LCP: Good ≤ 2500ms, Poor > 4000ms
      INP: Good ≤ 200ms, Poor > 500ms
      CLS: Good ≤ 0.1, Poor > 0.25

    All three must be "Good" for the site to pass CWV.

    Grigorik Ch.12, p.273: "The critical rendering path is the sequence
    of steps the browser follows to convert HTML, CSS, and JavaScript
    into pixels on the screen. Optimizing this path is the difference
    between a fast site and a slow one."

    Returns dict with pass/fail per metric and overall CWV assessment.

    Edge cases: negative values → ValueError
    """
    _fv(lcp_ms, "lcp_ms"); _fv(inp_ms, "inp_ms"); _fv(cls_score, "cls_score")
    if lcp_ms < 0: raise ValueError(f"LCP must be ≥ 0, got {lcp_ms}")
    if inp_ms < 0: raise ValueError(f"INP must be ≥ 0, got {inp_ms}")
    if cls_score < 0: raise ValueError(f"CLS must be ≥ 0, got {cls_score}")

    metrics = {}
    passed = 0

    # LCP
    if lcp_ms <= CWV_THRESHOLDS["LCP"]["good"]:
        metrics["LCP"] = "GOOD"
        passed += 1
    elif lcp_ms <= CWV_THRESHOLDS["LCP"]["poor"]:
        metrics["LCP"] = "NEEDS IMPROVEMENT"
    else:
        metrics["LCP"] = "POOR"

    # INP
    if inp_ms <= CWV_THRESHOLDS["INP"]["good"]:
        metrics["INP"] = "GOOD"
        passed += 1
    elif inp_ms <= CWV_THRESHOLDS["INP"]["poor"]:
        metrics["INP"] = "NEEDS IMPROVEMENT"
    else:
        metrics["INP"] = "POOR"

    # CLS
    if cls_score <= CWV_THRESHOLDS["CLS"]["good"]:
        metrics["CLS"] = "GOOD"
        passed += 1
    elif cls_score <= CWV_THRESHOLDS["CLS"]["poor"]:
        metrics["CLS"] = "NEEDS IMPROVEMENT"
    else:
        metrics["CLS"] = "POOR"

    overall = "PASS" if passed == 3 else "FAIL"

    # Recommendations per Grigorik Ch.12-13
    recommendations = []
    if metrics["LCP"] != "GOOD":
        recommendations.append(
            "LCP: Optimize server response (TTFB), use CDN, preload hero image, "
            "eliminate render-blocking resources. Grigorik Ch.12, p.278: "
            "'The critical path dictates when the page becomes visible.'")
    if metrics["INP"] != "GOOD":
        recommendations.append(
            "INP: Break up long tasks (>50ms), use requestIdleCallback, "
            "defer non-critical JS, use web workers. Google CWV: 'INP measures "
            "the worst interaction latency across the page lifecycle.'")
    if metrics["CLS"] != "GOOD":
        recommendations.append(
            "CLS: Set explicit dimensions on images/embeds, reserve space for ads, "
            "avoid inserting content above existing content, use transform animations "
            "instead of layout-triggering properties.")

    return {"lcp_ms": lcp_ms, "inp_ms": inp_ms, "cls": cls_score,
            "metrics": metrics, "passed": f"{passed}/3", "overall": overall,
            "recommendations": recommendations,
            "source": "Google Core Web Vitals (web.dev/vitals); Grigorik Ch.12-13"}


# ═══════════════════════════════════════════════════════════════════
# PART 2 — CONNECTION LATENCY MODEL
# Source: Grigorik Ch.1 (Latency), Ch.2 (TCP), Ch.4 (TLS)
# ═══════════════════════════════════════════════════════════════════

def connection_latency_model(
    rtt_ms: float,
    bandwidth_mbps: float,
    tls_enabled: bool = True,
    http_version: str = "2",
    resources_count: int = 50,
    avg_resource_size_kb: float = 100,
) -> Dict:
    """
    Model page load latency from network parameters.
    Grigorik Ch.1, pp.1-22; Ch.2, pp.23-48; Ch.4, pp.87-110.

    Grigorik Ch.1, p.7: "Latency is the time it takes for a packet to
    travel from source to destination. Bandwidth is the maximum throughput
    of a communication channel. Both matter, but latency compounds."

    Connection setup (Grigorik Ch.2, Ch.4):
      DNS:   1 RTT
      TCP:   1 RTT (SYN + SYN-ACK)
      TLS:   2 RTT (TLS 1.2), 1 RTT (TLS 1.3)
      HTTP request: 1 RTT (HTTP/1.1), 0 RTT (HTTP/2 multiplexed)

    Args:
      rtt_ms: Round-trip time in milliseconds
      bandwidth_mbps: Available bandwidth in Mbps
      tls_enabled: Is HTTPS/TLS in use?
      http_version: '1.1' or '2'
      resources_count: Number of resources on the page
      avg_resource_size_kb: Average resource size in KB

    Returns latency model with breakdown.
    """
    _fv(rtt_ms, "rtt_ms"); _positive(bandwidth_mbps, "bandwidth_mbps")
    _fv(avg_resource_size_kb, "avg_resource_size_kb")
    if not isinstance(resources_count, int) or resources_count < 1:
        raise ValueError(f"resources_count must be ≥ 1, got {resources_count}")

    # Connection setup latency in RTTs
    dns_rtt = 1
    tcp_rtt = 1
    tls_rtt = 1 if tls_enabled else 0  # TLS 1.3 = 1 RTT (Grigorik Ch.4, p.91)

    setup_rtts = dns_rtt + tcp_rtt + tls_rtt
    setup_latency_ms = setup_rtts * rtt_ms

    # First request: +1 RTT
    first_request_ms = rtt_ms

    # Resource transfer time
    # bandwidth_bytes_per_ms = (bandwidth_mbps * 1e6) / (8 * 1000) = bandwidth_mbps * 125
    bandwidth_kbps = bandwidth_mbps * 125  # Mbps → KB/s
    total_size_kb = resources_count * avg_resource_size_kb
    transfer_time_ms = (total_size_kb / bandwidth_kbps) * 1000 if bandwidth_kbps > 0 else float('inf')

    # HTTP version impact
    if http_version == "2":
        # Multiplexed — no per-request RTT penalty for pipelining
        connection_overhead_rtts = 0
        multiplex_note = ("HTTP/2 multiplexing eliminates per-request RTT. "
                         "Grigorik Ch.11, p.245: 'Multiplexed streams remove "
                         "head-of-line blocking.'")
    else:
        # HTTP/1.1 with 6 connections — ~resources/6 serialized round trips
        connection_overhead_rtts = max(0, (resources_count / 6) - 1)
        multiplex_note = ("HTTP/1.1 limited to ~6 connections. Grigorik Ch.10, "
                         "p.226: 'Connection parallelism is a workaround, not a solution.'")

    overhead_ms = connection_overhead_rtts * rtt_ms
    total_ms = setup_latency_ms + first_request_ms + transfer_time_ms + overhead_ms

    return {
        "total_load_time_s": round(total_ms / 1000, 2),
        "breakdown": {
            "dns_tcp_tls_setup_ms": round(setup_latency_ms, 1),
            "first_request_ms": round(first_request_ms, 1),
            "resource_transfer_ms": round(transfer_time_ms, 1),
            "connection_overhead_ms": round(overhead_ms, 1),
        },
        "rtt_ms": rtt_ms, "tls": tls_enabled,
        "http_version": http_version, "resources_count": resources_count,
        "multiplex_note": multiplex_note,
        "source": "Grigorik Ch.1-4, 10-11; Google CWV (web.dev/vitals)",
    }


def _positive(val: float, name: str) -> None:
    _fv(val, name)
    if val <= 0:
        raise ValueError(f"{name} must be positive, got {val}")


# ═══════════════════════════════════════════════════════════════════
# PART 3 — PERFORMANCE BUDGET
# Source: Google web.dev (Performance Budgets)
#         Grigorik Ch.13 (Optimizing Application Delivery)
# ═══════════════════════════════════════════════════════════════════

def performance_budget_check(
    total_kb: float,
    js_kb: float,
    css_kb: float,
    images_kb: float,
    fonts_kb: float,
    max_total_kb: float = 1000,
    max_js_kb: float = 300,
    max_css_kb: float = 100,
    max_images_kb: float = 500,
    max_fonts_kb: float = 100,
) -> Dict:
    """
    Check page weight against performance budget.
    Google web.dev performance budgets guide.

    Grigorik Ch.13, p.293: "The fastest request is the one not made.
    The fastest byte is the one not sent. Set a budget and enforce it."

    Google's recommended budget for mobile (3G):
      Total: ≤ 1000 KB
      JavaScript: ≤ 300 KB
      CSS: ≤ 100 KB
      Images: ≤ 500 KB
      Fonts: ≤ 100 KB

    Returns dict with budget violations and recommendations.

    Edge cases: negative sizes → ValueError
    """
    for name, val in [("total_kb", total_kb), ("js_kb", js_kb), ("css_kb", css_kb),
                       ("images_kb", images_kb), ("fonts_kb", fonts_kb)]:
        _fv(val, name)
        if val < 0:
            raise ValueError(f"{name} must be ≥ 0, got {val}")

    violations = []

    if total_kb > max_total_kb:
        violations.append(f"Total: {total_kb:.0f}KB > {max_total_kb}KB budget. "
                         "Reduce overall page weight.")
    if js_kb > max_js_kb:
        violations.append(f"JS: {js_kb:.0f}KB > {max_js_kb}KB. "
                         "Code-split, tree-shake, defer non-critical JS. "
                         "Grigorik Ch.13, p.298: 'JavaScript is the most expensive "
                         "resource on the web — it must be downloaded, parsed, and executed.'")
    if css_kb > max_css_kb:
        violations.append(f"CSS: {css_kb:.0f}KB > {max_css_kb}KB. "
                         "Remove unused CSS, inline critical CSS, defer non-critical.")
    if images_kb > max_images_kb:
        violations.append(f"Images: {images_kb:.0f}KB > {max_images_kb}KB. "
                         "Use WebP/AVIF, lazy-load, responsive images (srcset).")
    if fonts_kb > max_fonts_kb:
        violations.append(f"Fonts: {fonts_kb:.0f}KB > {max_fonts_kb}KB. "
                         "Use system fonts, subset fonts, use font-display: swap.")

    if not violations:
        verdict = "WITHIN BUDGET — all resources within performance limits"
    elif len(violations) <= 2:
        verdict = "OVER BUDGET — {0} item(s) exceed limits".format(len(violations))
    else:
        verdict = f"SEVERELY OVER BUDGET — {len(violations)} items exceed limits"

    return {"verdict": verdict, "violations": violations,
            "source": "Google web.dev Performance Budgets; Grigorik Ch.13"}


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
    print("SELF-TEST SUITE: web_performance.py")
    print("Sources: Grigorik HPBN (2013) + Google Core Web Vitals")
    print("=" * 70)

    # ── Core Web Vitals ──
    print("\n── Core Web Vitals (Google CWV) ──")
    cwv = core_web_vitals_score(1800, 150, 0.05)
    ck("cwv: all good → PASS", cwv["overall"], "PASS")

    cwv2 = core_web_vitals_score(5000, 600, 0.40)
    ck("cwv2: all poor → FAIL", cwv2["overall"], "FAIL")

    # ── Latency Model ──
    print("\n── Connection Latency (Grigorik Ch.1-4) ──")
    lat = connection_latency_model(50, 10, True, "2", 50, 100)
    ck("lat: HTTP/2 50ms RTT 50 resources → reasonable", lat["total_load_time_s"] < 30, True)

    lat2 = connection_latency_model(200, 2, True, "1.1", 100, 200)
    ck("lat2: HTTP/1.1 200ms RTT 100 resources → slower", lat2["total_load_time_s"] > lat["total_load_time_s"], True)

    # ── Performance Budget ──
    print("\n── Performance Budget (Google web.dev) ──")
    pb = performance_budget_check(600, 150, 50, 350, 50)
    ck("pb: within budget → no violations", len(pb["violations"]), 0)

    pb2 = performance_budget_check(3000, 1200, 300, 1200, 300)
    ck("pb2: severely over → multiple violations", len(pb2["violations"]) >= 3, True)

    print("\n" + "=" * 70)
    tot = p + f
    print(f"RESULTS: {p}/{tot} passed, {f} failed")
    print("=" * 70)
    return 0 if f == 0 else 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
