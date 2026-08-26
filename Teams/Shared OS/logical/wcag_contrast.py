#!/usr/bin/env python3
"""
wcag_contrast.py — WCAG 2.2 contrast-ratio computation + threshold verdict.

===================================================================
SOURCES (per playbook §8.3, §8.4 Tier A extraction 2026-07-29)
===================================================================

Primary source (institutional):
  W3C Web Content Accessibility Guidelines (WCAG) 2.2
  W3C Recommendation 12 December 2024
  https://www.w3.org/TR/WCAG22/

  Extracted successcriteria and threshold values from live spec text:
    - §1.4.3 Contrast (Minimum), Level AA (line 661-670 of fetched source)
        "contrast ratio of at least 4.5:1"
        Large text (18pt / 14pt bold): "at least 3:1" (line 673)
    - §1.4.6 Contrast (Enhanced), Level AAA (line 714-723)
        "contrast ratio of at least 7:1"
        Large text: "at least 4.5:1" (line 726)
    - §1.4.11 Non-text Contrast, Level AA (line 826-835)
        "contrast ratio of at least 3:1 against adjacent color(s)"
    - Focus indicator (§2.4.11-13 area): "contrast ratio of at least 3:1
        between the same pixels in the focused and unfocused states" (line 1363)

Contrast-ratio formula (WCAG canonical, quoted verbatim from spec dfn):
    "(L1 + 0.05) / (L2 + 0.05), where"
        L1 = relative luminance of the lighter of the two colors
        L2 = relative luminance of the darker

Relative-luminance formula (WCAG §Understanding Relative Luminance):
    For sRGB:
        R_srgb = R_8bit / 255
        R_linear = R_srgb / 12.92        if R_srgb <= 0.04045
                 = ((R_srgb + 0.055) / 1.055) ** 2.4  otherwise
        (same for G, B)
        L = 0.2126 * R_linear + 0.7152 * G_linear + 0.0722 * B_linear

Second source (§8.0 minimum-two-book):
  Okabe & Ito (2008) — colour-blind-safe palette research (referenced by
  WCAG techniques; palette itself is public/free at
  https://jfly.uni-koeln.de/color/). Not the contrast formula source but
  the second corroborating institutional reference on colour accessibility.

===================================================================
ROUTES (§8.2)
===================================================================
  Route A: contrast-ratio arithmetic (deterministic mathematics)
  Route B: threshold classification (WCAG success-criterion → pass/fail rules)

===================================================================
CONSUMERS
===================================================================
  Primary: Teams/Data & Analytics/viz/custom/viz-accessibility/SKILL.md
  Potential cross-agent consumers (§13.5 promotion candidates):
    - Brand Studio/pixel (visual design)
    - Engineering/mia (dashboards + web UI)

===================================================================
PROVENANCE DISCIPLINE (playbook §0.5, §0.6)
===================================================================
- Every threshold cited to WCAG 2.2 success criterion number.
- No invented thresholds.
- ratio() is deterministic arithmetic; grades() is the WCAG rule set.
- Self-tests use W3C-published example values from Understanding docs.
"""

import argparse
import math
import sys
from typing import Tuple


# ---------------- Contrast-ratio math (Route A) ----------------

def _srgb_to_linear(c: float) -> float:
    """sRGB → linear-RGB per WCAG relative-luminance formula.

    c is a channel value in [0, 1] (already divided by 255).
    """
    if not 0.0 <= c <= 1.0:
        raise ValueError(f"channel must be in [0, 1]; got {c}")
    if c <= 0.04045:
        return c / 12.92
    return ((c + 0.055) / 1.055) ** 2.4


def relative_luminance(r8: int, g8: int, b8: int) -> float:
    """WCAG relative luminance from 8-bit sRGB.

    r8, g8, b8 in [0, 255].
    Returns L in [0, 1].
    """
    for name, v in (("r", r8), ("g", g8), ("b", b8)):
        if not 0 <= v <= 255:
            raise ValueError(f"{name} must be in [0, 255]; got {v}")
    r = _srgb_to_linear(r8 / 255)
    g = _srgb_to_linear(g8 / 255)
    b = _srgb_to_linear(b8 / 255)
    # Coefficients per WCAG Relative Luminance formula.
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast_ratio(
    fg: Tuple[int, int, int], bg: Tuple[int, int, int]
) -> float:
    """WCAG contrast ratio between foreground and background.

    Formula (WCAG canonical):
        (L1 + 0.05) / (L2 + 0.05)
        where L1 = max(L_fg, L_bg), L2 = min(L_fg, L_bg)

    Returns a value in [1.0, 21.0].
    """
    lfg = relative_luminance(*fg)
    lbg = relative_luminance(*bg)
    l1, l2 = (lfg, lbg) if lfg > lbg else (lbg, lfg)
    return (l1 + 0.05) / (l2 + 0.05)


# ---------------- WCAG threshold rule set (Route B) ----------------

def _threshold_for(
    is_large_text: bool, is_non_text: bool, level: str
) -> float:
    """Return the WCAG required contrast ratio for the (level, text-type) tuple.

    level in {"AA", "AAA"}.
    is_large_text: >= 18pt or >= 14pt bold (per WCAG large-scale dfn).
    is_non_text: UI components, graphics, focus indicators (§1.4.11 domain).
    """
    if level not in ("AA", "AAA"):
        raise ValueError(f"level must be AA or AAA; got {level!r}")
    if is_non_text:
        # §1.4.11 Non-text Contrast is Level AA only in WCAG 2.2;
        # there is no defined AAA non-text threshold in this spec version.
        return 3.0
    # Text criteria
    if level == "AA":
        return 3.0 if is_large_text else 4.5
    # AAA
    return 4.5 if is_large_text else 7.0


def grades(
    fg: Tuple[int, int, int],
    bg: Tuple[int, int, int],
    *,
    is_large_text: bool = False,
    is_non_text: bool = False,
) -> dict:
    """Full WCAG verdict for a foreground/background pair.

    Returns a dict:
      ratio: float
      passes_AA: bool
      passes_AAA: bool
      required_AA: float
      required_AAA: float
      surface: "text" | "large-text" | "non-text"
      cited_criteria: list of WCAG success-criterion references
    """
    r = contrast_ratio(fg, bg)
    req_aa = _threshold_for(is_large_text, is_non_text, "AA")
    req_aaa = _threshold_for(is_large_text, is_non_text, "AAA")
    surface = "non-text" if is_non_text else ("large-text" if is_large_text else "text")
    if is_non_text:
        cited = ["WCAG 2.2 §1.4.11 Non-text Contrast (AA)"]
    else:
        cited = [
            "WCAG 2.2 §1.4.3 Contrast (Minimum) (AA)",
            "WCAG 2.2 §1.4.6 Contrast (Enhanced) (AAA)",
        ]
    return {
        "ratio": round(r, 3),
        "passes_AA": r >= req_aa,
        "passes_AAA": r >= req_aaa,
        "required_AA": req_aa,
        "required_AAA": req_aaa,
        "surface": surface,
        "cited_criteria": cited,
    }


# ---------------- Self-tests (playbook §5.2) ----------------

def _hex_to_rgb(hexstr: str) -> Tuple[int, int, int]:
    h = hexstr.lstrip("#")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def _run_self_tests() -> None:
    """Test with values from the W3C published Understanding docs +
    canonical anchor pairs."""
    # 1. Black on white = 21:1 (maximum possible)
    r = contrast_ratio((0, 0, 0), (255, 255, 255))
    assert abs(r - 21.0) < 0.001, f"black-on-white expected 21.0, got {r}"
    print(f"[PASS] black on white ratio = {r:.2f}")

    # 2. White on white = 1.0 (minimum, identity)
    r = contrast_ratio((255, 255, 255), (255, 255, 255))
    assert abs(r - 1.0) < 0.001, f"white-on-white expected 1.0, got {r}"
    print(f"[PASS] identity contrast = {r:.2f}")

    # 3. Common design pair: #767676 gray on white (a well-known boundary
    #    of AA text) — should sit just above 4.5:1 per W3C examples.
    r = contrast_ratio(_hex_to_rgb("#767676"), _hex_to_rgb("#FFFFFF"))
    assert 4.4 < r < 4.7, f"#767676 on white expected ~4.54, got {r}"
    print(f"[PASS] #767676 on white ratio ≈ {r:.2f} (WCAG AA boundary)")

    # 4. Verdict — #767676 on white for normal text passes AA, fails AAA.
    v = grades(_hex_to_rgb("#767676"), _hex_to_rgb("#FFFFFF"))
    assert v["passes_AA"] and not v["passes_AAA"], f"unexpected: {v}"
    print(f"[PASS] #767676 verdict: AA {v['passes_AA']} · AAA {v['passes_AAA']}")

    # 5. Same pair as non-text (icon): should pass AA (3:1 threshold).
    v = grades(_hex_to_rgb("#767676"), _hex_to_rgb("#FFFFFF"), is_non_text=True)
    assert v["passes_AA"], f"non-text should pass: {v}"
    print(f"[PASS] #767676 non-text passes AA at {v['ratio']:.2f}:1")

    # 6. Symmetry: fg/bg swap yields same ratio.
    r1 = contrast_ratio((100, 100, 100), (200, 200, 200))
    r2 = contrast_ratio((200, 200, 200), (100, 100, 100))
    assert abs(r1 - r2) < 1e-9, "contrast should be symmetric"
    print(f"[PASS] symmetry: {r1:.3f} == {r2:.3f}")

    # 7. Threshold lookups match WCAG spec verbatim.
    assert _threshold_for(False, False, "AA") == 4.5
    assert _threshold_for(True, False, "AA") == 3.0
    assert _threshold_for(False, False, "AAA") == 7.0
    assert _threshold_for(True, False, "AAA") == 4.5
    assert _threshold_for(False, True, "AA") == 3.0
    print("[PASS] threshold lookups match WCAG 2.2 §1.4.3/1.4.6/1.4.11")

    # 8. Provenance: grades() cites the right criteria.
    v = grades((0, 0, 0), (255, 255, 255))
    assert "1.4.3" in v["cited_criteria"][0]
    assert "1.4.6" in v["cited_criteria"][1]
    v = grades((0, 0, 0), (255, 255, 255), is_non_text=True)
    assert "1.4.11" in v["cited_criteria"][0]
    print("[PASS] citation strings match WCAG success-criterion numbers")


def _main() -> int:
    p = argparse.ArgumentParser(description="WCAG 2.2 contrast calculator")
    p.add_argument("--fg", help="foreground hex (e.g. #333333)")
    p.add_argument("--bg", help="background hex (e.g. #FFFFFF)")
    p.add_argument("--large", action="store_true", help="text >= 18pt or 14pt bold")
    p.add_argument("--non-text", action="store_true", help="UI component / icon")
    p.add_argument("--test", action="store_true", help="run self-tests")
    args = p.parse_args()

    if args.test or (not args.fg and not args.bg):
        _run_self_tests()
        return 0

    if not (args.fg and args.bg):
        print("--fg and --bg both required", file=sys.stderr)
        return 2

    v = grades(
        _hex_to_rgb(args.fg),
        _hex_to_rgb(args.bg),
        is_large_text=args.large,
        is_non_text=getattr(args, "non_text"),
    )
    for k, val in v.items():
        print(f"{k}: {val}")
    return 0


if __name__ == "__main__":
    sys.exit(_main())
