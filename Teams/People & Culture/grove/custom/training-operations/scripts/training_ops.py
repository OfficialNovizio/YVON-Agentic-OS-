"""
training_ops.py — arithmetic utility for the training-operations skill.

Provenance (§0.5):
    IMPLEMENTED-FROM-DESCRIPTION. The Anthropic training-operations-administration
    plugin's SKILL.md references this script by name and describes its functions
    (audit-trail validation across 4 required fields; days-until-expiry computation;
    renewal-alert status with 90-day default lead time; completion status rollup by
    department) but the file was NOT included in the packaged plugin.

    The 4 required audit-trail fields are:
      1. person identifier (employee ID or full name)
      2. course / regulation code
      3. timestamp (completion date/time)
      4. attestation (signed acknowledgement or scored assessment result)

Classification (§8, §13.5):
    NOT a Shared OS/logical/ script. §8.0 two-book minimum unmet.
    Candidate second-source books for graduation:
      - Rothstein, M. A. et al. Employment Law casebook (shared candidate with hire's
        worker_classification.py).
      - An LMS-administration institutional guide (ATD or SHRM publication).

Self-tests: run `python3 training_ops.py --test`.
"""

from __future__ import annotations

import sys
from datetime import date, datetime
from typing import Dict, List, Tuple


# ---------- Required audit-trail fields ----------

REQUIRED_AUDIT_FIELDS = ("person", "course_code", "timestamp", "attestation")


# ---------- Audit-trail validation ----------

def validate_audit_trail(record: Dict) -> Tuple[bool, List[str]]:
    """Check whether a compliance-training record has all 4 required fields.

    Args:
        record: Dict potentially containing the required fields.

    Returns:
        (ok, missing_fields) — ok=True if all 4 present and non-empty; missing_fields
        is the list of REQUIRED_AUDIT_FIELDS that are absent, None, or empty-string.

    Raises:
        TypeError: if record is not a dict.
    """
    if not isinstance(record, dict):
        raise TypeError(f"record must be a dict; got {type(record).__name__}")
    missing = []
    for field in REQUIRED_AUDIT_FIELDS:
        value = record.get(field)
        if value is None or (isinstance(value, str) and value.strip() == ""):
            missing.append(field)
    return (len(missing) == 0, missing)


# ---------- Days until expiry ----------

def days_until_expiry(expiry_date, current_date=None) -> int:
    """Signed integer days from current_date to expiry_date.

    Args:
        expiry_date: date or datetime — when the certification/training expires.
        current_date: date or datetime — the reference "today"; defaults to today.

    Returns:
        Days from current to expiry. Positive = future; 0 = today; negative = already
        past.

    Raises:
        TypeError: if expiry_date is not a date/datetime.
    """
    if isinstance(expiry_date, datetime):
        expiry_date = expiry_date.date()
    elif not isinstance(expiry_date, date):
        raise TypeError(f"expiry_date must be date or datetime; got {type(expiry_date).__name__}")
    if current_date is None:
        current_date = date.today()
    elif isinstance(current_date, datetime):
        current_date = current_date.date()
    elif not isinstance(current_date, date):
        raise TypeError(f"current_date must be date, datetime, or None; got {type(current_date).__name__}")
    return (expiry_date - current_date).days


# ---------- Renewal alert status ----------

def expiry_alert_status(days_until: int, lead_time_days: int = 90) -> str:
    """Classify a certification's renewal urgency.

    Args:
        days_until: Signed days from now to expiry (from days_until_expiry()).
        lead_time_days: Default 90; when days_until <= this and > 30, status is ALERT.

    Returns:
        One of 'EXPIRED' / 'URGENT' / 'ALERT' / 'OK':
          - EXPIRED : days_until < 0
          - URGENT  : 0 <= days_until <= 30
          - ALERT   : 30 < days_until <= lead_time_days
          - OK      : days_until > lead_time_days

    Raises:
        ValueError: if lead_time_days <= 30 (would collapse the ALERT band).
    """
    if lead_time_days <= 30:
        raise ValueError("lead_time_days must be > 30 (otherwise the ALERT band collapses)")
    if days_until < 0:
        return "EXPIRED"
    if days_until <= 30:
        return "URGENT"
    if days_until <= lead_time_days:
        return "ALERT"
    return "OK"


# ---------- Completion-status rollup ----------

def rollup_completion_counts(records: List[Dict], group_by: str) -> Dict[str, Dict[str, int]]:
    """Group records by a field and count completed / incomplete / expired.

    Args:
        records: List of dicts. Each dict must contain the `group_by` field and a
            'status' field with one of 'COMPLETED' / 'INCOMPLETE' / 'EXPIRED'
            (case-insensitive on input; normalized to uppercase in output keys).
            Unknown statuses are counted under 'OTHER'.
        group_by: The field name to group by (e.g., 'department', 'venture', 'role').

    Returns:
        Dict mapping group_value → {'COMPLETED': N, 'INCOMPLETE': N, 'EXPIRED': N,
        'OTHER': N}.

    Raises:
        ValueError: if group_by is empty.
    """
    if not group_by:
        raise ValueError("group_by must be a non-empty string")
    out: Dict[str, Dict[str, int]] = {}
    for record in records:
        group_value = record.get(group_by, "UNGROUPED")
        raw_status = str(record.get("status", "")).strip().upper()
        if raw_status not in ("COMPLETED", "INCOMPLETE", "EXPIRED"):
            status = "OTHER"
        else:
            status = raw_status
        if group_value not in out:
            out[group_value] = {"COMPLETED": 0, "INCOMPLETE": 0, "EXPIRED": 0, "OTHER": 0}
        out[group_value][status] += 1
    return out


# ---------- Self-tests ----------

def _run_tests() -> int:
    failures = []

    # validate_audit_trail
    try:
        ok, missing = validate_audit_trail({
            "person": "emp-123",
            "course_code": "OSHA-10-2024",
            "timestamp": "2026-06-15T14:30:00Z",
            "attestation": "signed-acknowledgement-v3",
        })
        assert ok is True and missing == []

        ok, missing = validate_audit_trail({
            "person": "emp-123",
            "course_code": "OSHA-10-2024",
            # missing timestamp and attestation
        })
        assert ok is False
        assert set(missing) == {"timestamp", "attestation"}, missing

        ok, missing = validate_audit_trail({
            "person": "",   # empty string counts as missing
            "course_code": "X",
            "timestamp": "2026-06-15",
            "attestation": None,
        })
        assert ok is False
        assert set(missing) == {"person", "attestation"}, missing

        try:
            validate_audit_trail("not a dict")
            failures.append("validate_audit_trail should raise TypeError on non-dict")
        except TypeError:
            pass
    except AssertionError as e:
        failures.append(f"validate_audit_trail: {e}")

    # days_until_expiry
    try:
        today = date(2026, 7, 31)
        # future expiry
        assert days_until_expiry(date(2026, 12, 31), today) == 153
        # today
        assert days_until_expiry(date(2026, 7, 31), today) == 0
        # past
        assert days_until_expiry(date(2026, 1, 1), today) == -211
        # datetime input
        assert days_until_expiry(datetime(2026, 12, 31, 15, 30), today) == 153
        try:
            days_until_expiry("2026-12-31", today)
            failures.append("days_until_expiry should raise on string input")
        except TypeError:
            pass
    except AssertionError as e:
        failures.append(f"days_until_expiry: {e}")

    # expiry_alert_status
    try:
        assert expiry_alert_status(-5) == "EXPIRED"
        assert expiry_alert_status(0) == "URGENT"
        assert expiry_alert_status(15) == "URGENT"
        assert expiry_alert_status(30) == "URGENT"
        assert expiry_alert_status(31) == "ALERT"
        assert expiry_alert_status(60) == "ALERT"
        assert expiry_alert_status(90) == "ALERT"
        assert expiry_alert_status(91) == "OK"
        assert expiry_alert_status(365) == "OK"
        # Custom lead time
        assert expiry_alert_status(120, lead_time_days=180) == "ALERT"
        try:
            expiry_alert_status(50, lead_time_days=20)
            failures.append("expiry_alert_status should raise on lead_time_days <= 30")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"expiry_alert_status: {e}")

    # rollup_completion_counts
    try:
        recs = [
            {"department": "eng", "status": "COMPLETED"},
            {"department": "eng", "status": "COMPLETED"},
            {"department": "eng", "status": "INCOMPLETE"},
            {"department": "sales", "status": "EXPIRED"},
            {"department": "sales", "status": "COMPLETED"},
            {"department": "sales", "status": "weird_status"},   # → OTHER
        ]
        r = rollup_completion_counts(recs, group_by="department")
        assert r["eng"]["COMPLETED"] == 2
        assert r["eng"]["INCOMPLETE"] == 1
        assert r["eng"]["EXPIRED"] == 0
        assert r["eng"]["OTHER"] == 0
        assert r["sales"]["COMPLETED"] == 1
        assert r["sales"]["EXPIRED"] == 1
        assert r["sales"]["OTHER"] == 1
        # Case-insensitive status normalization
        r2 = rollup_completion_counts([{"department": "x", "status": "completed"}], group_by="department")
        assert r2["x"]["COMPLETED"] == 1
        # Missing group value → UNGROUPED bucket
        r3 = rollup_completion_counts([{"status": "COMPLETED"}], group_by="department")
        assert r3["UNGROUPED"]["COMPLETED"] == 1
        try:
            rollup_completion_counts([], group_by="")
            failures.append("rollup_completion_counts should raise on empty group_by")
        except ValueError:
            pass
    except AssertionError as e:
        failures.append(f"rollup_completion_counts: {e}")

    # REQUIRED_AUDIT_FIELDS integrity
    try:
        assert REQUIRED_AUDIT_FIELDS == ("person", "course_code", "timestamp", "attestation")
        assert len(REQUIRED_AUDIT_FIELDS) == 4
    except AssertionError as e:
        failures.append(f"REQUIRED_AUDIT_FIELDS: {e}")

    if failures:
        print("FAIL:")
        for f in failures:
            print(f"  - {f}")
        return 1
    print("OK — 4 functions + REQUIRED_AUDIT_FIELDS, all self-tests passed.")
    return 0


if __name__ == "__main__":
    if "--test" in sys.argv:
        sys.exit(_run_tests())
    print(__doc__)
