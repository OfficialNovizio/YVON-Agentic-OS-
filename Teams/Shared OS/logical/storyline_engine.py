#!/usr/bin/env python3
"""
Storyline Engine — McKee 5-Part Structure + Miller SB7 Framework
===================================================================
Sources (multi-book per §8.0 practitioner-operator wisdom):

  McKee, Robert, *Story: Substance, Structure, Style, and the Principles
  of Screenwriting* (HarperCollins, 1997)
    Ch.7 The Substance of Story (Gap Principle), Ch.8 Inciting Incident,
    Ch.9 Act Design, Ch.10 Scene Design, Ch.11 Scene Analysis,
    Ch.12 Composition, Ch.13 Crisis-Climax-Resolution, Ch.14 Antagonism.

  Miller, Donald, *Building a StoryBrand* (HarperCollins, 2017)
    ISBN: 978-0718033323.
    SB7 Framework: Character → Problem → Guide → Plan → CTA →
    Failure Stakes → Success.

  Campbell, Joseph, *The Hero with a Thousand Faces* (1949)
    Public domain. The monomyth / Hero's Journey 17-stage archetype.

Route: B/C (structural validator + narrative engine)
Imports: marketing_laws.py for Campbell's Hero's Journey archetype check.
"""

from __future__ import annotations
import math
import sys
from typing import Dict, List, Optional, Tuple


def _fv(val: float, name: str) -> None:
    if not isinstance(val, (int, float)):
        raise TypeError(f"{name} must be a number")
    if math.isnan(val) or math.isinf(val):
        raise ValueError(f"{name} is invalid")


def _pct(val: float, name: str) -> None:
    _fv(val, name)
    if val < 0.0 or val > 1.0:
        raise ValueError(f"{name} must be in [0, 1], got {val}")


# ═══════════════════════════════════════════════════════════════════
# PART 1 — 5-PART STRUCTURE VALIDATOR (McKee, Story, Ch.8-13)
# ═══════════════════════════════════════════════════════════════════

def validate_5_part_structure(
    has_inciting_incident: bool,
    inciting_incident_upsets_equilibrium: bool,  # Ch.8, p.169: must radically upset balance
    major_dramatic_question_present: bool,  # The question the climax must answer
    progressive_complications_count: int,  # How many escalating obstacles?
    complications_escalate: bool,  # Does each complication raise stakes?
    has_crisis: bool,
    crisis_is_dilemma: bool,  # Ch.13, p.283: "True choice is dilemma"
    has_climax: bool,
    climax_answers_major_question: bool,
    has_resolution: bool,
    resolution_shows_new_equilibrium: bool,
) -> Dict:
    """
    5-Part Structure Validator: does the narrative hit McKee's 5 beats?
    McKee, Story (1997), Ch.8-13.

    The 5 parts (McKee, Ch.8-13):
      1. INCITING INCIDENT (Ch.8, pp.163-185): Radically upsets the protagonist's
         equilibrium. Raises the Major Dramatic Question.
      2. PROGRESSIVE COMPLICATIONS (Ch.9, pp.186-207): Escalating obstacles.
         Each one harder than the last. Stakes rise.
      3. CRISIS (Ch.13, pp.278-290): The obligatory scene. A genuine dilemma —
         choice between irreconcilable goods or lesser evils.
      4. CLIMAX (Ch.13, pp.291-300): Action flows from crisis decision.
         Irreversible. Answers the Major Dramatic Question.
      5. RESOLUTION (Ch.13, pp.301-307): New equilibrium shown. Subplots closed.

    Args:
      has_inciting_incident: Is there a clear inciting event?
      inciting_incident_upsets_equilibrium: Does it genuinely disrupt the status quo?
      major_dramatic_question_present: Is there an explicit question driving the story?
      progressive_complications_count: Number of escalating obstacles.
      complications_escalate: Do obstacles get harder?
      has_crisis: Is there a crisis moment (the decision)?
      crisis_is_dilemma: Is the crisis a genuine dilemma?
      has_climax: Is there a climactic action?
      climax_answers_major_question: Does the climax resolve the dramatic question?
      has_resolution: Is there a resolution/denouement?
      resolution_shows_new_equilibrium: Does it show the new normal?

    Returns structure validation score, missing elements, and McKee compliance.
    """
    beats = {
        "inciting_incident": {"present": has_inciting_incident,
                              "upsets_equilibrium": inciting_incident_upsets_equilibrium,
                              "major_question": major_dramatic_question_present,
                              "weight": 20},
        "progressive_complications": {"count": progressive_complications_count,
                                      "escalates": complications_escalate,
                                      "weight": 20},
        "crisis": {"present": has_crisis,
                   "is_dilemma": crisis_is_dilemma,
                   "weight": 20},
        "climax": {"present": has_climax,
                   "answers_question": climax_answers_major_question,
                   "weight": 25},
        "resolution": {"present": has_resolution,
                       "shows_new_equilibrium": resolution_shows_new_equilibrium,
                       "weight": 15},
    }

    scores = {}
    total = 0.0
    missing = []

    # Inciting Incident (20 pts)
    if has_inciting_incident and inciting_incident_upsets_equilibrium:
        ii_score = 20
        if major_dramatic_question_present:
            ii_score += 0  # already included in 20
    elif has_inciting_incident:
        ii_score = 12
        if not inciting_incident_upsets_equilibrium:
            missing.append("Inciting Incident does not upset equilibrium (McKee, Ch.8, p.169)")
        if not major_dramatic_question_present:
            missing.append("No Major Dramatic Question raised (McKee, Ch.8, p.175)")
    else:
        ii_score = 0
        missing.append("MISSING: Inciting Incident (McKee, Ch.8). Story has no disruption.")

    # Progressive Complications (20 pts)
    if progressive_complications_count >= 3 and complications_escalate:
        pc_score = 20
    elif progressive_complications_count >= 1:
        pc_score = 10
        if not complications_escalate:
            missing.append("Complications do not escalate (McKee, Ch.9, p.189)")
        if progressive_complications_count < 3:
            missing.append(f"Only {progressive_complications_count} complications; McKee recommends ≥3 for adequate act development")
    else:
        pc_score = 0
        missing.append("MISSING: Progressive Complications (McKee, Ch.9). No obstacles.")

    # Crisis (20 pts)
    if has_crisis and crisis_is_dilemma:
        cr_score = 20
    elif has_crisis:
        cr_score = 10
        missing.append("Crisis present but not a genuine dilemma (McKee, Ch.13, p.283)")
    else:
        cr_score = 0
        missing.append("MISSING: Crisis (McKee, Ch.13). No moment of decision.")

    # Climax (25 pts) — highest weight; without climax, there is no story
    if has_climax and climax_answers_major_question:
        cl_score = 25
    elif has_climax:
        cl_score = 12
        missing.append("Climax does not answer Major Dramatic Question (McKee, Ch.13, p.294)")
    else:
        cl_score = 0
        missing.append("MISSING: Climax (McKee, Ch.13). Story has no payoff.")

    # Resolution (15 pts)
    if has_resolution and resolution_shows_new_equilibrium:
        rs_score = 15
    elif has_resolution:
        rs_score = 8
        missing.append("Resolution present but does not show new equilibrium (McKee, Ch.13, p.303)")
    else:
        rs_score = 3  # minor deduction; some stories deliberately omit resolution
        missing.append("No Resolution (McKee, Ch.13, p.301). Story ends abruptly after climax.")

    total = ii_score + pc_score + cr_score + cl_score + rs_score
    beats_present = sum(1 for b in [has_inciting_incident, progressive_complications_count > 0,
                                     has_crisis, has_climax, has_resolution] if b)

    if beats_present == 5 and total >= 90:
        verdict = ("FULL McKEE STRUCTURE — all 5 beats present, properly constructed. "
                   "This narrative has the structural integrity of a professionally designed story.")
    elif beats_present >= 4 and total >= 65:
        verdict = f"STRONG STRUCTURE — {beats_present}/5 beats present. {len(missing)} structural issues to address."
    elif beats_present >= 3:
        verdict = f"PARTIAL STRUCTURE — {beats_present}/5 beats present. {len(missing)} critical gaps."
    else:
        verdict = f"WEAK STRUCTURE — only {beats_present}/5 McKee beats present. This is not a story yet."

    return {"structure_score": round(total, 1), "max_score": 100,
            "beats_present": f"{beats_present}/5",
            "beat_scores": {"inciting_incident": ii_score, "progressive_complications": pc_score,
                          "crisis": cr_score, "climax": cl_score, "resolution": rs_score},
            "missing_elements": missing,
            "verdict": verdict,
            "source": "McKee, Story (1997), Ch.8-13 (5-Part Dramatic Structure)"}


# ═══════════════════════════════════════════════════════════════════
# PART 2 — GAP DETECTION (McKee, Ch.7)
# ═══════════════════════════════════════════════════════════════════

def detect_gaps(
    turning_points: List[Dict],  # Each: {"expectation": str, "result": str, "gap_magnitude": float 0-1}
) -> Dict:
    """
    Gap Detection: are expectations subverted at each turning point?
    McKee, Story (1997), Ch.7, pp.145-162.

    McKee (Ch.7, p.150): "Story is born in the Gap."
    The Gap = the difference between what the protagonist EXPECTED to happen
    and what ACTUALLY happened. At every turning point, the gap must be:
    - PRESENT (expectation != result)
    - MEANINGFUL (not a trivial difference)
    - INCREASING (gaps should widen over the course of the story)

    Args:
      turning_points: List of turning point dicts. Each must have:
        "expectation" (str), "result" (str), "gap_magnitude" (float 0-1).

    Returns gap analysis with gap strength profile.
    """
    if not turning_points:
        return {"gaps_detected": 0, "total_turning_points": 0,
                "has_gaps": False, "gaps_escalate": False,
                "gap_profile": [],
                "verdict": "NO TURNING POINTS — cannot assess gaps. "
                          "McKee (Ch.7, p.150): 'Without turning points, there is no story.'",
                "source": "McKee, Story (1997), Ch.7 (The Gap Principle)"}

    for tp in turning_points:
        for field in ["expectation", "result", "gap_magnitude"]:
            if field not in tp:
                raise ValueError(f"Each turning point must have '{field}'")
        _pct(tp["gap_magnitude"], "gap_magnitude")

    gap_magnitudes = []
    gap_profile = []

    for i, tp in enumerate(turning_points):
        has_gap = tp["expectation"].lower().strip() != tp["result"].lower().strip()
        mag = tp["gap_magnitude"] if has_gap else 0.0
        gap_magnitudes.append(mag)

        if mag >= 0.7:
            level = "MAJOR GAP — expectation radically subverted. McKee (Ch.7, p.152): 'The greater the gap, the greater the drama.'"
        elif mag >= 0.4:
            level = "MODERATE GAP — expectation meaningfully subverted."
        elif has_gap:
            level = "MINOR GAP — expectation mildly subverted; may need amplification."
        else:
            level = "NO GAP — expectation met. This is not a turning point (McKee, Ch.10, p.215)."

        gap_profile.append({
            "turning_point": i + 1,
            "expectation": tp["expectation"][:50],
            "result": tp["result"][:50],
            "gap_magnitude": round(mag, 2),
            "has_gap": has_gap,
            "level": level
        })

    gaps_count = sum(1 for g in gap_profile if g["has_gap"])
    avg_magnitude = sum(gap_magnitudes) / len(gap_magnitudes) if gap_magnitudes else 0.0

    # Do gaps escalate? (McKee, Ch.9, p.189: "Complications must progress in difficulty.")
    escalates = all(
        gap_magnitudes[i] >= gap_magnitudes[i-1] * 0.7
        for i in range(1, len(gap_magnitudes))
    ) if len(gap_magnitudes) >= 2 else True

    if gaps_count == len(turning_points) and escalates and avg_magnitude >= 0.5:
        verdict = ("STRONG GAP STRUCTURE — every turning point opens a gap, and gaps escalate. "
                   "McKee (Ch.7, p.153): 'This is how stories sustain engagement.'")
    elif gaps_count >= len(turning_points) * 0.7:
        verdict = ("ADEQUATE GAPS — most turning points have meaningful gaps. "
                  f"{len(turning_points) - gaps_count} turning point(s) lack gaps.")
    else:
        verdict = (f"WEAK GAP STRUCTURE — only {gaps_count}/{len(turning_points)} turning points have gaps. "
                   "McKee (Ch.7, p.150): 'Without gaps, there is no drama — only exposition.'")

    return {"gaps_detected": gaps_count,
            "total_turning_points": len(turning_points),
            "has_gaps": gaps_count > 0,
            "gaps_escalate": escalates,
            "avg_gap_magnitude": round(avg_magnitude, 2),
            "gap_profile": gap_profile,
            "verdict": verdict,
            "source": "McKee, Story (1997), Ch.7 (The Gap Principle); Ch.9 (Complications Escalation)"}


# ═══════════════════════════════════════════════════════════════════
# PART 3 — CHARACTER-DESIRE-ANTAGONISM TRIANGLE CHECKER
# ═══════════════════════════════════════════════════════════════════

def check_character_triangle(
    conscious_desire_defined: bool,
    unconscious_desire_defined: bool,
    antagonist_defined: bool,
    conscious_desire: str = "",
    unconscious_desire: str = "",
    antagonist_type: str = "",  # 'person', 'society', 'nature', 'self', 'system', 'false_solution'
    antagonist_is_negation_of_negation: bool = False,  # McKee's highest form of antagonism
    guide_present: bool = False,  # StoryBrand: guide character
) -> Dict:
    """
    Character-Desire-Antagonism Triangle Checker.
    McKee, Story (1997), Ch.5 (Character), Ch.14 (Antagonism).
    Miller, Building a StoryBrand (2017), Ch.3 (Guide).

    McKee's character model (Ch.5, pp.92-98):
      1. CONSCIOUS DESIRE: What the character WANTS. The external goal.
      2. UNCONSCIOUS DESIRE: What the character NEEDS. The internal truth.
      3. ANTAGONISM: The sum total of forces opposing the desire.

    McKee's Negation of the Negation (Ch.14, pp.318-322): The highest form
    of antagonism is not the opposite of the positive value — it's the
    DOUBLE-NEGATIVE. A negative disguised as a positive, which is MORE dangerous.
    e.g., Love → Hate (contrary) → Hate masquerading as Love (negation of negation).

    Miller's guide (SB7, Ch.3): The brand is NOT the hero. The brand is the GUIDE
    who helps the hero (customer) navigate the story. The guide has two attributes:
    empathy ("I understand your pain") and authority ("I can help you").

    Args:
      conscious_desire_defined: Is the external want clear?
      conscious_desire: The stated conscious desire (for logging).
      unconscious_desire_defined: Is the internal need clear?
      unconscious_desire: The stated unconscious desire (for logging).
      antagonist_defined: Is the opposing force clear?
      antagonist_type: What kind of antagonist?
      antagonist_is_negation_of_negation: Is it the highest form of antagonism?
      guide_present: Is there a guide (per StoryBrand)?

    Returns triangle health score and character depth assessment.
    """
    score = 0.0
    issues = []

    if conscious_desire_defined:
        score += 30
    else:
        issues.append("CONSCIOUS DESIRE MISSING — character has no external goal (McKee, Ch.5, p.92)")

    if unconscious_desire_defined:
        score += 25
        if conscious_desire_defined and conscious_desire.lower() == unconscious_desire.lower():
            issues.append("Conscious and unconscious desire are identical — no character depth (McKee, Ch.5, p.97)")
            score -= 10
    else:
        issues.append("UNCONSCIOUS DESIRE MISSING — character has no internal need. This flattens character depth (McKee, Ch.5, p.95)")

    if antagonist_defined:
        base_antag_score = 25
        if antagonist_is_negation_of_negation:
            base_antag_score += 10  # Bonus for highest form of antagonism
            score += base_antag_score
        else:
            score += base_antag_score
            if antagonist_type not in {"self", "system", "false_solution"}:
                issues.append(f"Antagonist is '{antagonist_type}' — consider escalating to the Negation of the Negation "
                            "(McKee, Ch.14, p.318). e.g., not just 'the evil competitor' but 'the lie they've sold the market.'")
    else:
        issues.append("ANTAGONIST MISSING — no opposing force. Without antagonism, there is no story (McKee, Ch.14, p.310)")

    if guide_present:
        score += 10
        # Check: the guide is not the protagonist
    else:
        # Guide is optional in McKee, required in StoryBrand
        pass

    if score >= 80:
        depth = ("STRONG CHARACTER TRIANGLE — conscious + unconscious desire, powerful antagonist, guide present. "
                 "McKee (Ch.5, p.101): 'Character is choice under pressure.' This character will face true pressure.")
    elif score >= 50:
        depth = f"ADEQUATE TRIANGLE — functional but {len(issues)} structural gaps limit character depth."
    else:
        depth = f"WEAK OR MISSING TRIANGLE — {len(issues)} critical gaps. Character is a sketch, not a protagonist."

    return {"triangle_score": round(score, 1), "max_score": 100,
            "conscious_desire": conscious_desire,
            "unconscious_desire": unconscious_desire,
            "antagonist_type": antagonist_type,
            "negation_of_negation": antagonist_is_negation_of_negation,
            "guide_present": guide_present,
            "issues": issues,
            "depth_assessment": depth,
            "source": "McKee (1997), Ch.5 (Character), Ch.14 (Antagonism); Miller (2017), SB7 Ch.3 (Guide)"}


# ═══════════════════════════════════════════════════════════════════
# PART 4 — SCENE VALUE-CHANGE DETECTOR
# ═══════════════════════════════════════════════════════════════════

def detect_scene_value_change(
    scenes: List[Dict],  # Each: {"value_opening": str (+/-), "value_closing": str (+/-), "has_conflict": bool}
) -> Dict:
    """
    Scene Value-Change Detector: does each scene turn?
    McKee, Story (1997), Ch.10, pp.208-233.

    McKee (Ch.10, p.211): "A scene is a story in miniature — an action through
    conflict that turns the value-charged condition of a character's life."

    McKee's acid test (Ch.10, p.215): "If a scene does not turn — if the value
    does not change charge — it is not a scene. It is an expository interlude."

    Args:
      scenes: List of scene dicts. Each must have:
        "value_opening" (str: "+" or "-"),
        "value_closing" (str: "+" or "-"),
        "has_conflict" (bool)

    Returns scene-by-scene analysis and overall scene health.
    """
    if not scenes:
        return {"scenes_analyzed": 0, "scenes_that_turn": 0,
                "turning_ratio": 0.0, "has_no_scene": True,
                "verdict": "NO SCENES — nothing to analyze.",
                "source": "McKee, Story (1997), Ch.10 (Scene Design)"}

    analysis = []
    turning_count = 0
    conflict_count = 0

    for i, sc in enumerate(scenes):
        for field in ["value_opening", "value_closing", "has_conflict"]:
            if field not in sc:
                raise ValueError(f"Scene {i+1} missing field '{field}'")

        opening = sc["value_opening"].strip()
        closing = sc["value_closing"].strip()

        if opening not in ("+", "-") or closing not in ("+", "-"):
            raise ValueError(f"Scene {i+1}: value_opening and value_closing must be '+' or '-'")

        turns = opening != closing
        has_conflict = sc["has_conflict"]

        if turns:
            turning_count += 1
        if has_conflict:
            conflict_count += 1

        if turns and has_conflict:
            status = "SCENE — turns AND has conflict. McKee-compliant."
        elif turns:
            status = "WEAK SCENE — turns but no conflict. McKee (Ch.10, p.213): 'Conflict is the engine of turning points.'"
        elif has_conflict:
            status = "FLAT SCENE — has conflict but doesn't turn. Value charge unchanged. McKee (Ch.10, p.215): 'If it doesn't turn, it's not a scene.'"
        else:
            status = "NOT A SCENE — no turning point, no conflict. This is an expository interlude. Cut or restructure."

        analysis.append({
            "scene": i + 1,
            "opening": opening, "closing": closing,
            "turns": turns, "has_conflict": has_conflict,
            "status": status
        })

    turning_ratio = turning_count / len(scenes)

    if turning_ratio >= 0.9:
        health = "STRONG SCENE DESIGN — nearly every scene turns. McKee (Ch.10, p.215): 'Scenes that turn create momentum.'"
    elif turning_ratio >= 0.6:
        health = f"ADEQUATE SCENE DESIGN — {turning_count}/{len(scenes)} scenes turn. {len(scenes) - turning_count} flat scenes need restructuring."
    else:
        health = f"WEAK SCENE DESIGN — only {turning_count}/{len(scenes)} scenes turn. Most of this narrative is exposition, not story."

    return {"scenes_analyzed": len(scenes),
            "scenes_that_turn": turning_count,
            "scenes_with_conflict": conflict_count,
            "turning_ratio": round(turning_ratio, 2),
            "scene_analysis": analysis,
            "overall_health": health,
            "source": "McKee, Story (1997), Ch.10 (Scene Design); Ch.11 (Scene Analysis)"}


# ═══════════════════════════════════════════════════════════════════
# PART 5 — SB7 FRAMEWORK CHECKER (Miller, Building a StoryBrand)
# ═══════════════════════════════════════════════════════════════════

def check_sb7_framework(
    character_defined: bool,        # #1: A CHARACTER who wants something
    problem_defined: bool,          # #2: Has a PROBLEM (external + internal + philosophical)
    guide_defined: bool,            # #3: Meets a GUIDE (empathy + authority)
    guide_has_empathy: bool,        # Must show "I understand your pain"
    guide_has_authority: bool,      # Must show "I have the competence to help"
    plan_defined: bool,             # #4: Guide gives a PLAN
    plan_is_simple: bool,           # Plan must be simple — 3 steps or fewer
    call_to_action_defined: bool,   # #5: CALLS them to action (direct + transitional)
    failure_stakes_defined: bool,   # #6: Shows what's at stake if they FAIL
    success_vision_defined: bool,   # #7: Shows what SUCCESS looks like
) -> Dict:
    """
    SB7 Framework Checker: does the brand story follow Miller's 7-part framework?
    Miller, Building a StoryBrand (2017), Ch.2-8.

    SB7 Framework (Miller, 2017):
      1. A CHARACTER (the customer, NOT the brand)
      2. Has a PROBLEM (external, internal, philosophical — all three layers)
      3. Meets a GUIDE (the brand — with empathy AND authority)
      4. Who gives them a PLAN (simple, 3 steps or fewer)
      5. And CALLS them to action (direct CTA + transitional CTA)
      6. That helps them avoid FAILURE (what's at stake?)
      7. And ends in SUCCESS (what does the transformed life look like?)

    Key Miller rule: "The customer is the hero. The brand is the guide. Brands
    that cast themselves as the hero lose the customer."

    Args:
      (all args are booleans representing whether each SB7 element is present)

    Returns SB7 score, per-element breakdown, and missing element guidance.
    """
    elements = {
        "1_character": {"present": character_defined, "label": "A Character (customer as hero)",
                        "weight": 15, "fix": "Define the customer as the protagonist. Not the brand."},
        "2_problem": {"present": problem_defined, "label": "Has a Problem (external + internal + philosophical)",
                      "weight": 15, "fix": "Define the villain (external problem), the internal frustration, and the philosophical wrong."},
        "3_guide": {"present": guide_defined and guide_has_empathy and guide_has_authority,
                    "label": "Meets a Guide (empathy + authority)", "weight": 20,
                    "fix": "The brand is the guide. Show: (1) empathy — 'we understand,' (2) authority — 'we can help.'"},
        "4_plan": {"present": plan_defined and plan_is_simple, "label": "Guide Gives a Plan (3 steps or fewer)",
                   "weight": 15, "fix": "Give a simple 3-step plan. If the customer can't remember it, they won't follow it."},
        "5_cta": {"present": call_to_action_defined, "label": "Calls Them to Action (direct + transitional)",
                  "weight": 15, "fix": "Include a direct CTA ('Buy now') AND a transitional CTA ('Download our free guide')."},
        "6_failure": {"present": failure_stakes_defined, "label": "Shows Failure Stakes",
                      "weight": 10, "fix": "What does the customer lose by NOT acting? Make the cost of inaction vivid."},
        "7_success": {"present": success_vision_defined, "label": "Ends in Success",
                      "weight": 10, "fix": "Paint a picture of the transformed life. What does 'after' look like?"},
    }

    total = 0.0
    detail = {}
    missing = []

    for key, elem in elements.items():
        if elem["present"]:
            total += elem["weight"]
            detail[key] = {"present": True, "label": elem["label"], "score": elem["weight"]}
        else:
            detail[key] = {"present": False, "label": elem["label"], "score": 0}
            missing.append(elem["fix"])

    present_count = sum(1 for e in elements.values() if e["present"])
    has_guide_empathy = guide_defined and guide_has_empathy
    has_guide_authority = guide_defined and guide_has_authority

    if present_count == 7:
        verdict = "FULL SB7 FRAMEWORK — all 7 elements present and correctly structured."
    elif present_count >= 5:
        verdict = f"STRONG SB7 — {present_count}/7 elements present. {len(missing)} gaps to address."
    elif present_count >= 3:
        verdict = f"PARTIAL SB7 — {present_count}/7 elements present. {len(missing)} significant gaps."
    else:
        verdict = f"WEAK SB7 — only {present_count}/7 elements present. The brand story is missing its structure."

    return {"sb7_score": round(total, 1), "max_score": 100,
            "elements_present": f"{present_count}/7",
            "element_details": detail,
            "missing_elements": missing,
            "guide_assessment": {
                "empathy": has_guide_empathy,
                "authority": has_guide_authority,
                "reminder": "Miller (SB7, Ch.3): 'The customer is the hero. The brand is the guide. Never confuse them.'"
            },
            "verdict": verdict,
            "source": "Miller, Building a StoryBrand (2017), Ch.2-8 (SB7 Framework)"}


# ═══════════════════════════════════════════════════════════════════
# PART 6 — CONTROLLING IDEA EXTRACTOR
# ═══════════════════════════════════════════════════════════════════

def extract_controlling_idea(
    story_description: str,
    stated_controlling_idea: str = "",
    value_at_stake: str = "",  # 'justice', 'love', 'freedom', 'truth', 'happiness', etc.
    cause_of_change: str = "",  # What action causes the value to shift?
) -> Dict:
    """
    Controlling Idea Extractor: identify the thematic spine.
    McKee, Story (1997), Ch.6, pp.110-132.

    McKee (Ch.6, p.115): "A Controlling Idea may be expressed in a single
    sentence describing how and why life undergoes change from one condition
    of existence at the beginning to another at the end."

    Formula: VALUE + CAUSE. "The story's climactic value (positive or negative)
    caused by the protagonist's final action."

    Examples from McKee (Ch.6, pp.118-125):
      - Dirty Harry: "Justice prevails because the protagonist is more violent
        than the criminals." (Value: Justice; Cause: superior violence)
      - Groundhog Day: "Happiness fills our lives when we learn to love
        unconditionally." (Value: Happiness; Cause: unconditional love)

    Args:
      story_description: Brief description of the story.
      stated_controlling_idea: If the author has stated the controlling idea.
      value_at_stake: The core value at stake in the climax.
      cause_of_change: What action causes the value to shift?

    Returns controlling idea analysis and robustness check.
    """
    if not story_description.strip():
        raise ValueError("story_description cannot be empty")

    # Check if stated controlling idea follows the VALUE + CAUSE formula
    has_value_cause_format = False
    format_feedback = ""

    if stated_controlling_idea:
        has_because = "because" in stated_controlling_idea.lower() or "when" in stated_controlling_idea.lower()
        has_when = "when" in stated_controlling_idea.lower()
        has_value = value_at_stake.strip() != ""
        has_cause = cause_of_change.strip() != ""

        if has_because or has_when:
            has_value_cause_format = True
        if has_value and has_cause:
            has_value_cause_format = True

        if not has_value_cause_format:
            format_feedback = ("Controlling Idea does not follow McKee's VALUE + CAUSE formula. "
                             "Should be: '[Value] [prevails/fails] because [cause].' (McKee, Ch.6, p.115)")
    else:
        format_feedback = "No stated Controlling Idea. Extract one using the VALUE + CAUSE formula."

    # Idealist vs. Pessimist vs. Ironic controlling idea (McKee, Ch.6, pp.118-125)
    if value_at_stake.lower() in {"justice", "love", "freedom", "truth", "happiness", "good"}:
        if "prevails" in cause_of_change.lower() or "triumph" in cause_of_change.lower():
            worldview = "IDEALIST — the positive value triumphs (Hollywood ending archetype)."
        elif "fails" in cause_of_change.lower() or "destroys" in cause_of_change.lower():
            worldview = "PESSIMIST — the negative value triumphs (tragedy archetype)."
        else:
            worldview = "IRONIC/COMPLEX — the controlling idea expresses the fusion of positive and negative (McKee's preferred mode)."
    else:
        worldview = "UNDETERMINED — value category unclear."

    robustness = "STRONG" if has_value_cause_format else "NEEDS WORK"

    return {"stated_controlling_idea": stated_controlling_idea if stated_controlling_idea else "NOT PROVIDED",
            "value_at_stake": value_at_stake,
            "cause_of_change": cause_of_change,
            "value_cause_format": has_value_cause_format,
            "worldview": worldview,
            "robustness": robustness,
            "format_feedback": format_feedback,
            "example_reference": ("McKee (Ch.6, p.118): 'Dirty Harry' — "
                                 "'Justice prevails because the protagonist is more violent than the criminals.'"),
            "source": "McKee, Story (1997), Ch.6 (Structure and Meaning — The Controlling Idea)"}


# ═══════════════════════════════════════════════════════════════════
# PART 7 — TENSION CURVE ESTIMATOR
# ═══════════════════════════════════════════════════════════════════

def estimate_tension_curve(
    act_tensions: List[float],  # peak tension per act (0-10 scale)
    pacing_assessment: str = "moderate",  # 'slow', 'moderate', 'fast', 'erratic'
) -> Dict:
    """
    Tension Curve Estimator: does the narrative tension rise appropriately?
    McKee, Story (1997), Ch.9 (Act Design), Ch.12 (Composition).

    McKee's tension rules:
      1. Tension must generally RISE across acts (Ch.9, pp.189-195).
      2. Act One: establish baseline; end higher than it started (Inciting Incident bump).
      3. Act Two: progressive complications → rising tension; end at the "darkest moment."
      4. Act Three: climax peak → rapid resolution drop.

    Args:
      act_tensions: List of peak tension values per act (0-10 scale).
        e.g., [3, 7, 9, 2] for Acts 1-3 + Resolution.
      pacing_assessment: Qualitative pacing assessment.

    Returns tension curve analysis with structural issues.
    """
    if not act_tensions:
        raise ValueError("act_tensions must be non-empty")

    for i, t in enumerate(act_tensions):
        _fv(t, f"act_tensions[{i}]")
        if t < 0 or t > 10:
            raise ValueError(f"act_tensions[{i}] must be 0-10, got {t}")

    issues = []
    n = len(act_tensions)

    # Check 1: Tension should rise from first to climax (second-to-last acts)
    if n >= 3:
        main_acts = act_tensions[:-1] if n >= 3 else act_tensions
        rising = all(main_acts[i] <= main_acts[i+1] + 0.5 for i in range(len(main_acts)-1))
        if not rising:
            issues.append("Tension does not consistently rise through acts (McKee, Ch.9, p.189: 'Progressive complications must intensify.')")

    # Check 2: Climax should be the highest tension point
    if n >= 3:
        climax_idx = n - 2  # Second-to-last item = climax
        pre_climax_max = max(act_tensions[:climax_idx]) if climax_idx > 0 else 0
        if act_tensions[climax_idx] < pre_climax_max:
            issues.append(f"Climax (act {climax_idx+1}) tension {act_tensions[climax_idx]} is lower than earlier peak {pre_climax_max}. "
                         "McKee (Ch.13, p.294): 'The climax must carry the greatest emotional weight.'")

    # Check 3: Resolution should drop significantly
    if n >= 4:
        climax_tension = act_tensions[-2]
        resolution_tension = act_tensions[-1]
        if resolution_tension > climax_tension:
            issues.append("Resolution tension exceeds climax tension — story peaks after the climax (McKee, Ch.13, p.305).")
        elif resolution_tension > climax_tension * 0.5:
            issues.append("Resolution is too tense — new equilibrium not established (McKee, Ch.13, p.303).")

    # Check 4: Act One shouldn't be too high (need room to build)
    if n >= 3 and act_tensions[0] > 6:
        issues.append("Act One tension is too high — no room to escalate. Tension starts at {act_tensions[0]}/10.")

    if not issues:
        tension_quality = "OPTIMAL TENSION CURVE — tension rises through acts, peaks at climax, resolves cleanly."
    elif len(issues) == 1:
        tension_quality = f"ADEQUATE CURVE — 1 structural issue: {issues[0]}"
    else:
        tension_quality = f"PROBLEMATIC CURVE — {len(issues)} structural issues found."

    # Overall curve score
    if not issues:
        score = 95.0
    elif len(issues) == 1:
        score = 75.0
    elif len(issues) == 2:
        score = 55.0
    else:
        score = 35.0

    return {"tension_curve_score": score,
            "act_tensions": act_tensions,
            "num_acts": n,
            "pacing": pacing_assessment,
            "tension_rises": all(act_tensions[i] <= act_tensions[i+1] + 0.5
                                for i in range(max(0, n-2))),
            "climax_is_peak": act_tensions[-2] == max(act_tensions[:-1]) if n >= 3 else True,
            "issues": issues,
            "quality": tension_quality,
            "source": "McKee, Story (1997), Ch.9 (Act Design); Ch.12 (Composition); Ch.13 (Climax)"}


# ═══════════════════════════════════════════════════════════════════
# PART 8 — COMPREHENSIVE STORYLINE AUDIT
# ═══════════════════════════════════════════════════════════════════

def storyline_audit(
    mckee_structure_result: Dict,
    gap_result: Dict,
    triangle_result: Dict,
    sb7_result: Dict,
    tension_result: Dict,
    controlling_idea_result: Optional[Dict] = None,
) -> Dict:
    """
    Comprehensive Storyline Audit: aggregates all narrative health checks.

    Combines McKee structural analysis, gap detection, character triangle,
    SB7 brand story framework, tension curve, and controlling idea into a
    single narrative health score.

    Returns overall storyline score and integrated recommendations.
    """
    components = {
        "mckee_structure": mckee_structure_result.get("structure_score", 0),
        "gap_analysis": min(100, gap_result.get("gaps_detected", 0) * 20),
        "character_triangle": triangle_result.get("triangle_score", 0),
        "sb7_framework": sb7_result.get("sb7_score", 0),
        "tension_curve": tension_result.get("tension_curve_score", 0),
    }

    if controlling_idea_result:
        ci_score = 100 if controlling_idea_result.get("value_cause_format", False) else 40
        components["controlling_idea"] = ci_score

    total = sum(components.values())
    count = len(components)
    avg = total / count

    if avg >= 80:
        overall = "PROFESSIONAL-GRADE NARRATIVE — this story is structurally sound, emotionally compelling, and brand-integrated."
    elif avg >= 60:
        overall = "STRONG DRAFT — good bones but needs structural tightening on the weakest components."
    elif avg >= 40:
        overall = "DEVELOPMENT NEEDED — significant structural gaps. Focus on the lowest-scoring component first."
    else:
        overall = "CONCEPT STAGE — narrative architecture is not yet in place. Start with McKee structures."

    return {"storyline_health_score": round(avg, 1),
            "components": components,
            "weakest_component": min(components, key=components.get) if components else "unknown",
            "strongest_component": max(components, key=components.get) if components else "unknown",
            "overall_verdict": overall,
            "sources": "McKee (1997), Story; Miller (2017), Building a StoryBrand; Campbell (1949), Hero's Journey"}


# ═══════════════════════════════════════════════════════════════════
# SELF-TEST SUITE
# ═══════════════════════════════════════════════════════════════════

def run_all_tests() -> int:
    f = 0; p = 0
    def ck(label, actual, expected, tol=1e-6):
        nonlocal f, p
        if isinstance(expected, bool):
            ok = actual == expected
        elif isinstance(expected, str):
            ok = expected in str(actual)
        elif isinstance(expected, (int, float)):
            ok = abs(actual - expected) <= tol
        else:
            ok = actual == expected
        if ok:
            print(f"  PASS  {label}: {str(actual)[:80]}")
            p += 1
        else:
            print(f"  FAIL  {label}: expected {expected}, got {str(actual)[:80]}")
            f += 1

    print("=" * 70)
    print("SELF-TEST SUITE: storyline_engine.py")
    print("McKee 5-Part Structure + Miller SB7 + Gap Detection")
    print("=" * 70)

    # ── 5-Part Structure Validator ──
    print("\n── 5-Part Structure Validator (McKee) ──")
    # Full structure (Star Wars, The Matrix, etc.)
    full_struct = validate_5_part_structure(
        has_inciting_incident=True, inciting_incident_upsets_equilibrium=True,
        major_dramatic_question_present=True,
        progressive_complications_count=5, complications_escalate=True,
        has_crisis=True, crisis_is_dilemma=True,
        has_climax=True, climax_answers_major_question=True,
        has_resolution=True, resolution_shows_new_equilibrium=True,
    )
    ck("full mckee structure → >90", full_struct["structure_score"] > 90, True)
    ck("5/5 beats present", "5/5" in full_struct["beats_present"], True)

    # Missing elements
    weak_struct = validate_5_part_structure(
        has_inciting_incident=True, inciting_incident_upsets_equilibrium=True,
        major_dramatic_question_present=False,
        progressive_complications_count=2, complications_escalate=False,
        has_crisis=False, crisis_is_dilemma=False,
        has_climax=True, climax_answers_major_question=True,
        has_resolution=False, resolution_shows_new_equilibrium=False,
    )
    ck("weak structure → <70", weak_struct["structure_score"] < 70, True)

    # ── Gap Detection ──
    print("\n── Gap Detection (McKee, Ch.7) ──")
    turning_points = [
        {"expectation": "Door opens easily", "result": "Door is locked", "gap_magnitude": 0.4},
        {"expectation": "Ally will help", "result": "Ally betrays them", "gap_magnitude": 0.7},
        {"expectation": "Plan will work", "result": "Plan fails catastrophically", "gap_magnitude": 0.9},
    ]
    gaps = detect_gaps(turning_points)
    ck("3 gaps detected", gaps["gaps_detected"] == 3, True)
    ck("gaps escalate", gaps["gaps_escalate"], True)

    # No gaps
    no_gaps = detect_gaps([
        {"expectation": "Door opens", "result": "Door opens", "gap_magnitude": 0.0},
        {"expectation": "Ally helps", "result": "Ally helps", "gap_magnitude": 0.0},
    ])
    ck("no gaps → 0 detected", no_gaps["gaps_detected"] == 0, True)

    # ── Character-Desire-Antagonism Triangle ──
    print("\n── Character-Desire-Antagonism Triangle ──")
    strong_tri = check_character_triangle(
        conscious_desire_defined=True, conscious_desire="Destroy the Death Star",
        unconscious_desire_defined=True, unconscious_desire="Become a Jedi and find belonging",
        antagonist_defined=True, antagonist_type="system",
        antagonist_is_negation_of_negation=True,
        guide_present=True,
    )
    ck("full triangle → >80", strong_tri["triangle_score"] > 80, True)

    weak_tri = check_character_triangle(
        conscious_desire_defined=True, conscious_desire="Buy a product",
        unconscious_desire_defined=False, unconscious_desire="",
        antagonist_defined=False, antagonist_type="",
        guide_present=False,
    )
    ck("weak triangle → <40", weak_tri["triangle_score"] < 40, True)

    # ── Scene Value-Change Detector ──
    print("\n── Scene Value-Change Detector ──")
    good_scenes = [
        {"value_opening": "-", "value_closing": "+", "has_conflict": True},
        {"value_opening": "+", "value_closing": "-", "has_conflict": True},
        {"value_opening": "-", "value_closing": "+", "has_conflict": True},
    ]
    sv = detect_scene_value_change(good_scenes)
    ck("3/3 scenes turn", sv["scenes_that_turn"] == 3, True)
    ck("turning ratio = 1.0", sv["turning_ratio"] == 1.0, True)

    bad_scenes = [
        {"value_opening": "+", "value_closing": "+", "has_conflict": False},
        {"value_opening": "-", "value_closing": "-", "has_conflict": False},
    ]
    sv2 = detect_scene_value_change(bad_scenes)
    ck("0/2 scenes turn", sv2["scenes_that_turn"] == 0, True)

    # ── SB7 Framework Checker ──
    print("\n── SB7 Framework Checker (Miller) ──")
    full_sb7 = check_sb7_framework(
        character_defined=True, problem_defined=True,
        guide_defined=True, guide_has_empathy=True, guide_has_authority=True,
        plan_defined=True, plan_is_simple=True,
        call_to_action_defined=True, failure_stakes_defined=True, success_vision_defined=True,
    )
    ck("full SB7 → 7/7 elements", "7/7" in full_sb7["elements_present"], True)
    ck("SB7 score = 100", full_sb7["sb7_score"] >= 99.9, True)

    partial_sb7 = check_sb7_framework(
        character_defined=True, problem_defined=True,
        guide_defined=True, guide_has_empathy=False, guide_has_authority=True,
        plan_defined=False, plan_is_simple=False,
        call_to_action_defined=True, failure_stakes_defined=False, success_vision_defined=True,
    )
    ck("partial SB7 → <7/7", "7/7" not in partial_sb7["elements_present"], True)

    # ── Controlling Idea Extractor ──
    print("\n── Controlling Idea Extractor ──")
    ci = extract_controlling_idea(
        "A detective pursues a serial killer, using increasingly violent methods.",
        "Justice prevails because the protagonist is willing to become as violent as the criminals he pursues.",
        "Justice", "Protagonist's willingness to match criminal violence"
    )
    ck("controlling idea has VALUE+CAUSE", ci["value_cause_format"], True)

    ci2 = extract_controlling_idea(
        "A brand helps customers be more productive.",
        "Our software makes you productive.",
        "", ""
    )
    ck("no stated CI → robustness NEEDS WORK", ci2["robustness"] == "NEEDS WORK", True)

    # ── Tension Curve Estimator ──
    print("\n── Tension Curve Estimator ──")
    good_curve = estimate_tension_curve([3, 6, 9, 2])
    ck("rising + peak + resolution → high score", good_curve["tension_curve_score"] >= 90, True)

    bad_curve = estimate_tension_curve([8, 5, 7, 4])
    ck("erratic curve → low score", bad_curve["tension_curve_score"] < 60, True)

    # ── Comprehensive Storyline Audit ──
    print("\n── Comprehensive Storyline Audit ──")
    audit = storyline_audit(full_struct, gaps, strong_tri, full_sb7, good_curve, ci)
    ck("full audit → >80", audit["storyline_health_score"] > 80, True)

    print("\n" + "=" * 70)
    tot = p + f
    print(f"RESULTS: {p}/{tot} passed, {f} failed")
    print("=" * 70)
    return 0 if f == 0 else 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
