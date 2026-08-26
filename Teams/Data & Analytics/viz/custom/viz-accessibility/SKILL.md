---
name: viz-accessibility
type: custom
status: built from scratch
assigned_agent: viz (Data & Analytics / Visualisation)
portable: true
date_added: 2026-07-29
tier: 3
description: "WCAG-compliance audit for dashboards + charts. Contrast · alt-text · keyboard navigation · screen-reader compatibility · colour-blind simulation. Every dashboard must pass floor level before shipping."
triggers:
  - accessibility audit
  - WCAG check
  - a11y review
  - is this dashboard accessible
  - colour blind check
  - screen reader test
  - contrast check
---

# Viz Accessibility

## Introduction
Built 2026-07-29 as viz's WCAG-audit skill. Every dashboard produced by D&A must pass WCAG floor before shipping.

## Purpose
Audit dashboards + charts for accessibility floor: contrast ratio · alt-text · keyboard-navigability · screen-reader label · colour-blind-safe.

## When to Use
- "Accessibility audit" · "WCAG check" · "a11y review" · "colour blind check"
- Pre-ship gate for any dashboard produced downstream.

## Structure / Protocol
```
1. INTAKE      dashboard / chart URL or file
2. CONTRAST    computes contrast ratios; flag < 4.5:1 (WCAG AA)
3. ALT         checks every visual element has alt-text
4. KEYBOARD    verify all interactions keyboard-reachable
5. SCREEN      screen-reader label check
6. COLOURBLIND simulate deuteranopia / protanopia / tritanopia
7. REPORT      per-issue fix + severity
```

## Instructions
### Step 2: Contrast
Text ≥ 4.5:1 (AA) or 7:1 (AAA) against background. Non-text ≥ 3:1.

### Step 3: Alt-text
Every chart has a text summary of what it shows (not just "chart of X").

### Step 4: Keyboard
Every filter, dropdown, drill-down reachable via Tab; visible focus indicator.

### Step 5: Screen reader
Data table alternative for every chart; ARIA labels.

### Step 6: Colour-blind
Simulate 3 types; verify no information conveyed by colour alone.

### Step 7: Report
| Issue | Severity | Location | Fix |
|---|---|---|---|

Severity: 🔴 blocker (fails AA) · 🟠 fails AAA · 🟡 minor.

## Output Format
Per-dashboard audit report + pass/fail verdict + fixes.

## Principles
- **AA is the floor, not the ceiling.**
- **Colour is never the only channel** for information.
- **Alt-text is content, not marketing.** "Weekly revenue up 12%" not "line chart".
- **Blocker means ship-blocked**, not "should fix eventually".

## Fallback
| Failure | Response |
|---|---|
| Dashboard URL unreachable | Ask for export / screenshot |
| Ambiguous data type in chart | Route to `dashboard-standards` for shape decision |

## Boundaries
- `dashboard-standards` (this agent) — palette + shape rules.
- `dashboard-audit` (this agent) — portfolio-scale.
- `pixel` (Brand Studio) — general accessibility overlap; viz-a11y is chart-specific.
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| viz-accessibility | File read (dashboard) · Contrast-checker | Screen-reader emulator · Colour-blind sim | All steps |
