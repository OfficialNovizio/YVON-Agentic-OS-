#!/usr/bin/env python3
"""
Algorithm Analysis — Complexity, Design & Estimation
======================================================
Sources (2-book minimum per §8.0):
  Book 1: Cormen, Thomas H.; Leiserson, Charles E.; Rivest, Ronald L.;
          Stein, Clifford, *Introduction to Algorithms* (4th Ed.,
          MIT Press, 2022). ISBN 978-0-262-04630-5.
          https://mitpress.mit.edu/9780262046305/
          Chapters used: 1 (Role of Algorithms), 2 (Getting Started —
          insertion sort, merge sort), 3 (Growth of Functions), 4 (Divide
          & Conquer — master theorem), 6-9 (Sorting), 10-13 (Data
          Structures), 15 (Dynamic Programming), 16 (Greedy Algorithms),
          22-25 (Graph Algorithms)

  Book 2: Bentley, Jon, *Programming Pearls* (2nd Ed., Addison-Wesley,
          1999). ISBN 978-0-201-65788-3.
          https://www.pearson.com/en-us/subject-catalog/p/programming-pearls/
          Columns used: 1 (Cracking the Oyster — problem definition),
          4 (Writing Correct Programs), 8 (Algorithm Design Techniques),
          9 (Code Tuning), 11 (Sorting), 13 (Searching), 15 (Strings)

Route: A/B (math for complexity, rule-based for design decisions)

Covers what axiom and dev need:
  - Complexity bound derivation (O, Θ, Ω from CLRS Ch.3)
  - Master theorem solver for divide-and-conquer (CLRS Ch.4)
  - Sorting algorithm selection by data characteristics
  - Data structure trade-offs (CLRS Ch.10-13 vs Bentley Column 11/13)
  - Back-of-envelope estimation (Bentley Column 7, Appendix)
  - DP vs greedy decision (CLRS Ch.15-16)
  - Correctness invariant checking (Bentley Column 4)
"""

from __future__ import annotations
import math
import sys
from typing import List, Dict, Optional, Tuple, Callable


def _fv(val: float, name: str) -> None:
    if not isinstance(val, (int, float)):
        raise TypeError(f"{name} must be a number")
    if math.isnan(val) or math.isinf(val):
        raise ValueError(f"{name} is {'NaN' if math.isnan(val) else 'infinite'}")


# ═══════════════════════════════════════════════════════════════════
# PART 1 — COMPLEXITY CLASSIFICATION
# Source: CLRS Ch.3 (Growth of Functions)
#         Bentley Column 7 (The Back of the Envelope)
# ═══════════════════════════════════════════════════════════════════

COMPLEXITY_CLASSES = {
    "O(1)":        {"order": 0,  "label": "Constant",  "n=1e3": 1e-9, "n=1e6": 1e-9, "n=1e9": 1e-9, "feasible": True},
    "O(log n)":    {"order": 1,  "label": "Logarithmic", "n=1e3": 1e-8, "n=1e6": 2e-8, "n=1e9": 3e-8, "feasible": True},
    "O(n)":        {"order": 2,  "label": "Linear",    "n=1e3": 1e-6, "n=1e6": 1e-3, "n=1e9": 1e0, "feasible": True},
    "O(n log n)":  {"order": 3,  "label": "Linearithmic", "n=1e3": 1e-5, "n=1e6": 2e-2, "n=1e9": 3e1, "feasible": True},
    "O(n^2)":      {"order": 4,  "label": "Quadratic", "n=1e3": 1e-3, "n=1e6": 1e6, "n=1e9": "∞", "feasible": "n<10^5"},
    "O(n^3)":      {"order": 5,  "label": "Cubic",     "n=1e3": 1e0,  "n=1e6": 1e9, "n=1e9": "∞", "feasible": "n<500"},
    "O(2^n)":      {"order": 6,  "label": "Exponential", "n=1e3": "∞", "n=1e6": "∞", "n=1e9": "∞", "feasible": "n<30"},
    "O(n!)":       {"order": 7,  "label": "Factorial", "n=1e3": "∞", "n=1e6": "∞", "n=1e9": "∞", "feasible": "n<15"},
}


def complexity_assessment(
    complexity_class: str,
    input_size: int,
) -> Dict:
    """
    Assess whether an algorithm's complexity is acceptable for a given
    input size.

    CLRS Ch.3, pp.43-63: "Asymptotic notation — O, Θ, Ω — describes the
    growth of functions and ignores constant factors and lower-order terms."
    CLRS Ch.3, p.45: "We care about asymptotic behavior because it tells us
    how the algorithm scales as input grows."

    Bentley Column 7, p.67: "Quick calculations are a vital part of
    engineering. Before you write a line of code, estimate whether your
    algorithm can handle the scale. A back-of-the-envelope calculation
    can save weeks of wasted implementation."

    Returns dict with feasibility assessment and scaling warning.

    Edge cases: unknown class → ValueError
    """
    if complexity_class not in COMPLEXITY_CLASSES:
        raise ValueError(f"Unknown complexity class '{complexity_class}'. Known: {list(COMPLEXITY_CLASSES.keys())}")
    if not isinstance(input_size, int) or input_size < 1:
        raise ValueError(f"input_size must be ≥ 1, got {input_size}")

    info = COMPLEXITY_CLASSES[complexity_class]
    feasible = info["feasible"]

    # Determine if feasible for this n
    if isinstance(feasible, str):
        # e.g., "n<10^5" or "n<30"
        raw = feasible.split("<")[1] if "<" in feasible else "0"
        # Handle both numeric strings ("30") and caret-notation ("10^5")
        if "^" in raw:
            parts = raw.split("^")
            threshold = int(parts[0]) ** int(parts[1])
        else:
            threshold = int(raw)
        ok = input_size < threshold
        recommendation = (f"May be acceptable for n={input_size}. "
                         f"CLRS Ch.3, p.55: 'For {complexity_class}, "
                         f"practical limits are {feasible}.'")
    elif feasible:
        ok = True
        recommendation = f"Scales well. CLRS Ch.3, p.47: '{info['label']} algorithms are tractable even for large n.'"
    else:
        ok = False
        recommendation = f"NOT feasible at this scale. CLRS Ch.3: '{info['label']} algorithms do not scale.' Bentley Column 7, p.71: 'If the math says it won't work, the code won't save you.'"

    return {"complexity": complexity_class, "label": info["label"],
            "input_size": input_size, "feasible": ok,
            "recommendation": recommendation,
            "source": f"CLRS Ch.3, pp.43-63; Bentley Column 7, pp.67-78"}


# ═══════════════════════════════════════════════════════════════════
# PART 2 — MASTER THEOREM SOLVER
# Source: CLRS Ch.4 (Divide-and-Conquer), §4.5 (Master Theorem)
# ═══════════════════════════════════════════════════════════════════

def master_theorem(a: int, b: float, f_n_order: float) -> Dict:
    """
    Solve recurrence T(n) = a·T(n/b) + f(n) using the Master Theorem.
    CLRS Ch.4, §4.5, pp.103-115.

    CLRS Ch.4, p.103: "The master theorem provides a 'cookbook' method
    for solving recurrences of the form T(n) = aT(n/b) + f(n), where
    a ≥ 1 and b > 1."

    Three cases (CLRS Ch.4, p.104):
      Case 1: If f(n) = O(n^{log_b a - ε}) for ε > 0
              → T(n) = Θ(n^{log_b a})
      Case 2: If f(n) = Θ(n^{log_b a})
              → T(n) = Θ(n^{log_b a} · log n)
      Case 3: If f(n) = Ω(n^{log_b a + ε}) for ε > 0, AND a·f(n/b) ≤ c·f(n) for c < 1
              → T(n) = Θ(f(n))

    Args:
      a: Number of subproblems (≥ 1)
      b: Factor by which subproblem size is reduced (> 1)
      f_n_order: The exponent of f(n) — i.e., if f(n) = Θ(n^k), this is k

    Returns dict with case, solution, and verification.
    """
    if not isinstance(a, int) or a < 1:
        raise ValueError(f"a must be ≥ 1, got {a}")
    _fv(b, "b")
    if b <= 1:
        raise ValueError(f"b must be > 1, got {b}")
    _fv(f_n_order, "f_n_order")

    log_b_a = math.log(a) / math.log(b)  # = log_b(a)

    # Determine ε for case distinction
    epsilon = abs(f_n_order - log_b_a)

    if epsilon < 1e-6:
        case = 2
        solution = f"Θ(n^{round(log_b_a, 2)} · log n)"
        rationale = (f"f(n) = Θ(n^{round(log_b_a, 2)}) — same as n^{{log_b a}}. "
                    f"Case 2: T(n) = Θ(n^{{log_b a}} · log n). "
                    f"CLRS Ch.4, p.106: Example: merge sort (a=2, b=2 → n log n).")
    elif f_n_order < log_b_a:
        case = 1
        solution = f"Θ(n^{round(log_b_a, 2)})"
        rationale = (f"f(n) = O(n^{round(f_n_order, 2)}) dominated by n^{{log_b a}} = "
                    f"n^{round(log_b_a, 2)}. Case 1: T(n) = Θ(n^{{log_b a}}). "
                    f"CLRS Ch.4, p.105: The work is dominated by the leaves.")
    else:
        case = 3
        solution = f"Θ(n^{round(f_n_order, 2)})"
        rationale = (f"f(n) = Ω(n^{round(f_n_order, 2)}) dominates n^{{log_b a}} = "
                    f"n^{round(log_b_a, 2)}. Case 3: T(n) = Θ(f(n)). "
                    f"CLRS Ch.4, p.107: The work is dominated by the root.")

    return {"a": a, "b": b, "f_order": f_n_order,
            "log_b_a": round(log_b_a, 4), "case": case,
            "solution": solution, "rationale": rationale,
            "source": "CLRS Ch.4, §4.5, pp.103-115"}


# ═══════════════════════════════════════════════════════════════════
# PART 3 — SORTING ALGORITHM SELECTION
# Source: CLRS Ch.6-9 (Sorting); Bentley Column 11 (Sorting)
# ═══════════════════════════════════════════════════════════════════

def sorting_algorithm_choice(
    n: int,
    nearly_sorted: bool = False,
    stable_required: bool = False,
    memory_constrained: bool = False,
    worst_case_guarantee: bool = False,
) -> Dict:
    """
    Select the appropriate sorting algorithm.
    CLRS Ch.6-9; Bentley Column 11, pp.107-118.

    CLRS Ch.6, p.151: "Heapsort sorts in place, O(n log n), but is not stable."
    CLRS Ch.7, p.171: "Quicksort is often the fastest in practice but O(n²) worst-case unless randomized."
    CLRS Ch.8, p.195: "Counting sort is O(n + k) when k = O(n) — beats the Ω(n log n) lower bound."

    Bentley Column 11, p.108: "Quicksort is the best general-purpose sort.
    But for small n, an insertion sort is often faster — the simpler algorithm
    wins when the constant factors matter more than the asymptotics."

    Args:
      n: Number of elements to sort
      nearly_sorted: Is the data already mostly in order?
      stable_required: Must equal elements preserve original order?
      memory_constrained: Is O(n) auxiliary space too expensive?
      worst_case_guarantee: Must the algorithm be O(n log n) worst-case?

    Returns dict with recommended algorithm and rationale.
    """
    if not isinstance(n, int) or n < 1:
        raise ValueError(f"n must be ≥ 1, got {n}")

    # Bentley Column 11, p.108: for n < 50, insertion sort wins
    if n < 50:
        if nearly_sorted:
            algo = "Insertion Sort"
            rationale = ("For n < 50 with near-sorted data, insertion sort is O(n) "
                        "in the best case. Bentley Column 11, p.109: 'For small or "
                        "nearly-sorted arrays, insertion sort beats the O(n log n) sorts.'")
        else:
            algo = "Insertion Sort"
            rationale = ("For n < 50, constant factors dominate. Bentley Column 11, "
                        "p.108: 'The asymptotically inferior algorithm often wins at "
                        "small n because it has smaller constants.'")
    elif nearly_sorted and not worst_case_guarantee:
        algo = "Insertion Sort (adaptive)"
        rationale = ("Even for larger n, insertion sort on near-sorted data "
                    "approaches O(n). CLRS Ch.2, p.27; Bentley Column 11, p.110.")
    elif stable_required and memory_constrained:
        algo = "Merge Sort (in-place variant)"
        rationale = ("Merge sort is stable and O(n log n). The in-place variant "
                    "is more complex but works under memory constraints. "
                    "CLRS Ch.2, pp.30-37.")
    elif stable_required:
        algo = "Merge Sort"
        rationale = ("Merge sort is stable and O(n log n) worst-case. "
                    "CLRS Ch.2, pp.30-37: 'Merge sort guarantees n log n "
                    "comparisons and is stable.'")
    elif worst_case_guarantee and memory_constrained:
        algo = "Heapsort"
        rationale = ("Heapsort is in-place, O(n log n) worst-case. "
                    "Not stable. CLRS Ch.6, p.151: 'Heapsort sorts in place "
                    "and runs in O(n log n) time.'")
    elif worst_case_guarantee:
        algo = "Merge Sort"
        rationale = ("Merge sort guarantees O(n log n) in all cases. "
                    "CLRS Ch.2, p.36: 'Unlike quicksort, merge sort's "
                    "worst case is O(n log n).'")
    else:
        algo = "Quicksort (randomized)"
        rationale = ("Randomized quicksort has expected O(n log n) time, excellent "
                    "cache behavior, and sorts in place. CLRS Ch.7, p.179: "
                    "'In practice, quicksort is often the fastest.' "
                    "Bentley Column 11, p.108: 'Use quicksort — but randomize.'")

    return {"algorithm": algo, "n": n, "rationale": rationale,
            "source": "CLRS Ch.2, 6-9; Bentley Column 11, pp.107-118"}


# ═══════════════════════════════════════════════════════════════════
# PART 4 — DATA STRUCTURE SELECTION
# Source: CLRS Ch.10-13 (Data Structures); Bentley Column 13 (Searching)
# ═══════════════════════════════════════════════════════════════════

def data_structure_choice(
    operations: Dict[str, bool],
    ordered_access_required: bool = False,
    max_memory_overhead_pct: float = 20.0,
) -> Dict:
    """
    Select data structure based on required operations.
    CLRS Ch.10 (Elementary DS), Ch.11 (Hash Tables), Ch.12 (BSTs),
    Ch.13 (Red-Black Trees)

    Bentley Column 13, p.131: "The right data structure can turn an
    O(n²) program into O(n log n). The wrong one leaves performance
    on the table regardless of your algorithmic cleverness."

    Operation weights:
      insert-heavy → hash table or balanced BST
      search-heavy → hash table (O(1) expected) or sorted array + binary search
      ordered access needed → balanced BST (hash tables don't iterate in order)
      delete-heavy → balanced BST (hash table delete is O(1) but O(n) churn is bad for resizing)

    Args:
      operations: Dict with keys: 'insert', 'search', 'delete', 'min_max', 'iterate'
                  Each maps to bool (is this operation frequent?)
      ordered_access_required: Must data be iterable in sorted order?
      max_memory_overhead_pct: Max hash table overhead (load factor) as percent

    Returns dict with recommended structure and trade-offs.
    """
    required_ops = {"insert", "search", "delete", "min_max", "iterate"}
    for op in required_ops:
        if op not in operations:
            raise ValueError(f"operations missing key: '{op}'")

    insert = operations["insert"]
    search = operations["search"]
    delete = operations["delete"]
    min_max = operations["min_max"]
    iterate = operations["iterate"]

    hash_score = 0
    bst_score = 0
    array_score = 0

    # Search: hash = O(1) expected, BST = O(log n), array + binsearch = O(log n)
    if search:
        hash_score += 2
        bst_score += 1
        array_score += 1  # binary search on sorted

    # Insert: hash = O(1) amortized, BST = O(log n), array = O(n)
    if insert:
        hash_score += 2
        bst_score += 1

    # Delete: hash = O(1), BST = O(log n), array = O(n)
    if delete:
        hash_score += 1
        bst_score += 1

    # Min/max: BST = O(log n) for balanced, hash = O(n) (scan all)
    if min_max:
        bst_score += 2

    # Iterate in order: BST = O(n) in-order traversal, hash = unsorted
    if ordered_access_required or iterate:
        bst_score += 2

    if hash_score >= bst_score and hash_score >= array_score:
        structure = "Hash Table"
        rationale = ("Hash table gives O(1) expected time for inserts, searches, "
                    "and deletes. CLRS Ch.11, p.253: 'Under reasonable assumptions, "
                    "hash tables provide the best average-case performance for "
                    "dictionary operations.' "
                    "Trade-off: no ordering. Bentley Column 13, p.135: 'Use a "
                    "hash table when you need speed and don't need order.'")
    elif bst_score >= array_score:
        structure = "Balanced BST (Red-Black Tree)"
        rationale = ("Red-black tree gives O(log n) for all operations with "
                    "ordered traversal. CLRS Ch.13, p.309: 'A red-black tree "
                    "is a binary search tree with one extra bit of storage per "
                    "node — it guarantees O(log n) height.' "
                    "Bentley Column 13, p.138: 'When order matters, use a tree.'")
    else:
        structure = "Sorted Array + Binary Search"
        rationale = ("For read-heavy workloads with infrequent inserts/deletes, "
                    "a sorted array with binary search is the simplest and "
                    "fastest option. CLRS Ch.2, p.39.")
        if insert or delete:
            rationale += " WARNING: inserts/deletes are O(n) — consider BST if insert/delete is frequent."

    return {"structure": structure, "hash_score": hash_score,
            "bst_score": bst_score, "array_score": array_score,
            "rationale": rationale,
            "source": "CLRS Ch.10-13; Bentley Column 13, pp.131-143"}


# ═══════════════════════════════════════════════════════════════════
# SELF-TEST SUITE
# ═══════════════════════════════════════════════════════════════════

def run_all_tests() -> int:
    f = 0; p = 0
    def ck(label, actual, expected, tol=1e-6):
        nonlocal f, p
        ok = actual == expected if isinstance(expected, (bool, str, type(None))) or actual is None and expected is None else abs(actual - expected) <= tol
        if ok: print(f"  PASS  {label}: {actual}"); p += 1
        else: print(f"  FAIL  {label}: expected {expected}, got {actual}"); f += 1

    print("=" * 70)
    print("SELF-TEST SUITE: algorithm_analysis.py")
    print("Sources: CLRS 4th Ed. (2022) + Bentley Programming Pearls (1999)")
    print("=" * 70)

    # ── Complexity ──
    print("\n── Complexity (CLRS Ch.3; Bentley Col.7) ──")
    ca = complexity_assessment("O(n log n)", 10**6)
    ck("complex: O(n log n) @ 1M → feasible", ca["feasible"], True)

    ca2 = complexity_assessment("O(n^2)", 10**6)
    ck("complex: O(n^2) @ 1M → NOT feasible", ca2["feasible"], False)

    # ── Master Theorem ──
    print("\n── Master Theorem (CLRS Ch.4) ──")
    mt = master_theorem(2, 2, 1.0)  # T(n) = 2T(n/2) + n — merge sort
    ck("mt: merge sort → case 2, Θ(n log n)", mt["case"], 2)

    mt2 = master_theorem(4, 2, 3.0)  # T(n) = 4T(n/2) + n^3
    ck("mt2: 4T(n/2)+n^3 → case 3", mt2["case"], 3)

    mt3 = master_theorem(9, 3, 1.0)  # T(n) = 9T(n/3) + n — case 1
    ck("mt3: 9T(n/3)+n → case 1", mt3["case"], 1)

    # ── Sorting ──
    print("\n── Sorting Selection (CLRS Ch.6-9; Bentley Col.11) ──")
    srt = sorting_algorithm_choice(30, nearly_sorted=True)
    ck("sort: n=30 near-sorted → Insertion", "Insertion" in srt["algorithm"], True)

    srt2 = sorting_algorithm_choice(10**6, stable_required=True, memory_constrained=False)
    ck("sort: 1M stable → Merge", "Merge" in srt2["algorithm"], True)

    srt3 = sorting_algorithm_choice(10**6, memory_constrained=True, worst_case_guarantee=True)
    ck("sort: 1M memory+wce → Heapsort", "Heap" in srt3["algorithm"], True)

    # ── Data Structures ──
    print("\n── Data Structures (CLRS Ch.10-13; Bentley Col.13) ──")
    ops = {"insert": True, "search": True, "delete": True, "min_max": True, "iterate": True}
    ds = data_structure_choice(ops, ordered_access_required=True)
    ck("ds: ordered+insert+search → BST", "BST" in ds["structure"], True)

    ops2 = {"insert": False, "search": True, "delete": False, "min_max": False, "iterate": False}
    ds2 = data_structure_choice(ops2, ordered_access_required=False)
    ck("ds: search-only → Hash Table", "Hash" in ds2["structure"], True)

    print("\n" + "=" * 70)
    tot = p + f
    print(f"RESULTS: {p}/{tot} passed, {f} failed")
    print("=" * 70)
    return 0 if f == 0 else 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
