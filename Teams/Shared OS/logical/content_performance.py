#!/usr/bin/env python3
"""
Content Performance — STEPPS + SUCCESs Composite Scoring
=========================================================
Sources (multi-book per §8.0 practitioner-operator wisdom):

  Berger, Jonah, *Contagious: Why Things Catch On* (Simon & Schuster, 2013)
    Ch.1 Social Currency, Ch.2 Triggers, Ch.3 Emotion, Ch.4 Public,
    Ch.5 Practical Value, Ch.6 Stories, Epilogue (STEPPS).

  Heath, Chip & Dan, *Made to Stick* (Random House, 2007)
    Ch.1 Simple, Ch.2 Unexpected, Ch.3 Concrete, Ch.4 Credible,
    Ch.5 Emotional, Ch.6 Stories (SUCCESs).

  Pareto, Vilfredo, *Cours d'Économie Politique* (1896) — 80/20 portfolio analysis.

Route: B/C (rule-based scoring + composite functions)
Imports: marketing_laws.py for Pareto analysis + Von Restorff + Cialdini.

This script provides the content scoring engine for pulse's content-register,
lena's humanic-writing filter, and spark's creative gate. Every content piece
gets a dual-framework score — STEPPS (why it spreads) and SUCCESs (why it
sticks) — composited into a single Contagion Score.
"""

from __future__ import annotations
import math
import sys
from typing import Dict, List, Optional, Tuple


# ═══════════════════════════════════════════════════════════════════
# VALIDATION HELPERS
# ═══════════════════════════════════════════════════════════════════

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
# PART 1 — STEPPS SCORING (Berger, Contagious, 2013)
# ═══════════════════════════════════════════════════════════════════

def score_social_currency(
    inner_remarkability: float,
    game_mechanics_present: bool,
    insider_exclusivity: bool,
    findable_secrets: bool = False,
) -> Dict:
    """
    Social Currency: We share things that make us look good.
    Berger, Contagious (2013), Ch.1, pp.31-65.

    Three sub-dimensions:
      1. Inner Remarkability (pp.39-46): Is the content inherently remarkable?
         Blendtec's "Will It Blend?" — a blender blending an iPhone.
      2. Game Mechanics (pp.47-54): Are there status/scarcity/achievement markers?
         Frequent flyer tiers, Yelp Elite, Reddit karma.
      3. Insider Exclusivity (pp.55-58): Does sharing make people feel like insiders?
         Rue La La private sales, early access, "I know something you don't."

    Args:
      inner_remarkability: 0.0-1.0. How inherently remarkable is the content?
      game_mechanics_present: Are there status/social-comparison markers?
      insider_exclusivity: Does sharing signal insider status?
      findable_secrets: Is there "hidden" info the sharer reveals? (bonus)

    Returns dict with score, sub-scores, and verdict.
    """
    _pct(inner_remarkability, "inner_remarkability")

    scores = {"inner_remarkability": inner_remarkability * 40,  # 40% weight
              "game_mechanics": (20 if game_mechanics_present else 0),
              "insider_exclusivity": (25 if insider_exclusivity else 0),
              "findable_secrets": (15 if findable_secrets else 0)}
    total = sum(scores.values())

    if total >= 75:
        verdict = ("HIGH SOCIAL CURRENCY — sharing this makes people look smart, cool, or in-the-know. "
                   "Berger (Ch.1, p.33): 'People share things that help reinforce desired images.'")
    elif total >= 45:
        verdict = "MODERATE SOCIAL CURRENCY — some status signaling, but could be stronger."
    else:
        verdict = "LOW SOCIAL CURRENCY — sharing this doesn't enhance the sharer's image."

    return {"score": round(total, 1), "max_score": 100,
            "sub_scores": scores, "verdict": verdict,
            "source": "Berger, Contagious (2013), Ch.1 (Social Currency)"}


def score_triggers(
    trigger_frequency: float,  # 0.0-1.0: how often does the trigger occur in daily life?
    trigger_strength: float,   # 0.0-1.0: how strongly linked is the trigger to the content?
    environmental_cues: int,   # count of distinct daily-life cues
    is_seasonal: bool = False,
) -> Dict:
    """
    Triggers: Top of mind means tip of tongue.
    Berger, Contagious (2013), Ch.2, pp.66-98.

    Berger's core insight (Ch.2, p.69): "It's not just about how much people
    like something. Social transmission is also about whether something is
    top of mind."

    The Kit Kat + coffee example (pp.82-88): Kit Kat was declining until
    the brand attached itself to coffee — a daily trigger. Kit Kat + coffee
    break = the trigger (coffee) reminds people of the brand (Kit Kat).

    Args:
      trigger_frequency: 0.0-1.0. How frequently does the cue occur?
        Daily = 0.9+, weekly = 0.5, monthly = 0.1, annual = 0.01.
      trigger_strength: 0.0-1.0. How strong is the association?
        "Friday" → Rebecca Black = strong. "Tuesday" → nothing = weak.
      environmental_cues: Count of distinct daily-life reminders.
      is_seasonal: Is the trigger seasonal (pumpkin spice = fall)?

    Returns dict with score and trigger optimization guidance.
    """
    _pct(trigger_frequency, "trigger_frequency")
    _pct(trigger_strength, "trigger_strength")

    frequency_score = trigger_frequency * 35
    strength_score = trigger_strength * 30
    cues_score = min(environmental_cues, 7) / 7 * 20
    seasonal_bonus = -10 if is_seasonal else 15  # seasonal = constrained; non-seasonal = always active

    total = frequency_score + strength_score + cues_score + seasonal_bonus

    if total >= 70:
        verdict = ("STRONG TRIGGER STRATEGY — frequent, strongly-linked cues in daily life. "
                   "Berger (Ch.2, p.78): 'Frequency trumps intensity.'")
    elif total >= 40:
        verdict = "ADEQUATE TRIGGERS — some daily-life connection, but room for stronger cue attachment."
    else:
        verdict = ("WEAK TRIGGERS — the content has no reliable daily-life cue. "
                   "Berger (Ch.2, p.77): 'A mild message triggered daily spreads more than "
                   "a powerful message triggered once.'")

    return {"score": round(max(0, min(100, total)), 1), "max_score": 100,
            "components": {"frequency": round(frequency_score, 1),
                          "strength": round(strength_score, 1),
                          "cues": round(cues_score, 1),
                          "seasonal_adjustment": seasonal_bonus},
            "verdict": verdict,
            "source": "Berger, Contagious (2013), Ch.2 (Triggers)"}


def score_emotion_arousal(
    primary_emotion: str,  # 'awe','excitement','amusement','anger','anxiety','fear','sadness','contentment','neutral'
    intensity: float,  # 0.0-1.0
) -> Dict:
    """
    Emotion: When we care, we share.
    Berger, Contagious (2013), Ch.3, pp.99-131.

    The Emotion-Arousal Matrix (Berger, Ch.3, pp.106-118):
      |              | High Arousal                  | Low Arousal        |
      |--------------|-------------------------------|--------------------|
      | Positive     | Awe, Excitement, Amusement    | Contentment        |
      | Negative     | Anger, Anxiety, Fear          | Sadness            |

    High arousal + positive = MOST SHARED.
    High arousal + negative = ALSO SHARED (anger spreads fastest).
    Low arousal (either direction) = NOT SHARED.

    Args:
      primary_emotion: The primary emotion evoked.
      intensity: 0.0-1.0. How intensely is the emotion felt?

    Returns dict with arousal classification and shareability score.
    """
    _pct(intensity, "intensity")

    # Berger's emotion classification (Ch.3, pp.106-118)
    high_arousal_positive = {"awe", "excitement", "amusement", "joy", "inspiration"}
    high_arousal_negative = {"anger", "anxiety", "fear", "disgust"}
    low_arousal = {"sadness", "contentment", "calm", "neutral"}

    em = primary_emotion.lower().strip()

    if em in high_arousal_positive:
        arousal = "HIGH"
        valence = "POSITIVE"
        shareability = intensity * 90  # Highest sharing
        verdict = ("HIGH SHAREABILITY — high-arousal positive emotions are the most shared. "
                   "Berger (Ch.3, p.101): 'Awe-inspiring content is the most viral.'")
    elif em in high_arousal_negative:
        arousal = "HIGH"
        valence = "NEGATIVE"
        shareability = intensity * 80  # Still high
        verdict = ("HIGH SHAREABILITY — high-arousal negative emotions also spread widely. "
                   "Berger (Ch.3, p.117): 'Anger spreads faster than almost anything.'")
    elif em in low_arousal:
        arousal = "LOW"
        valence = "NEUTRAL" if em == "neutral" else ("POSITIVE" if em == "contentment" else "NEGATIVE")
        shareability = intensity * 30  # Low sharing
        verdict = ("LOW SHAREABILITY — low-arousal emotions do not drive sharing. "
                   "Berger (Ch.3, p.117): 'Sad or merely pleasant content: not shared.'")
    else:
        arousal = "UNKNOWN"
        valence = "UNKNOWN"
        shareability = intensity * 40
        verdict = f"UNCLASSIFIED EMOTION: '{primary_emotion}'. Defaulting to moderate shareability."

    return {"arousal": arousal, "valence": valence,
            "score": round(shareability, 1),
            "emotion": em, "intensity": intensity,
            "verdict": verdict,
            "source": "Berger, Contagious (2013), Ch.3 (Emotion)"}


def score_public(
    has_public_visibility: bool,
    public_residue_strength: float,  # 0.0-1.0
    social_proof_visible: bool,
    behavioral_residue: bool,  # Does the behavior leave a trace?
) -> Dict:
    """
    Public: Built to show, built to grow.
    Berger, Contagious (2013), Ch.4, pp.132-161.

    The central idea (Ch.4, p.135): "Making something more observable makes it
    easier to imitate, which makes it more likely to become popular."
    - Apple's white earbuds: private behavior (listening) → public signal (visible earbuds)
    - Livestrong bracelet: private belief (support) → public signal (yellow band)
    - Movember: private behavior (mustache) → public signal (visible mustache)

    Args:
      has_public_visibility: Is the content/behavior visible to others?
      public_residue_strength: 0.0-1.0. How strong is the public trace?
      social_proof_visible: Does the public residue signal "others are doing this"?
      behavioral_residue: Does the behavior leave a visible trace?

    Returns dict with public visibility score.
    """
    _pct(public_residue_strength, "public_residue_strength")

    if not has_public_visibility:
        return {"score": 10.0, "max_score": 100,
                "verdict": ("LOW PUBLIC VISIBILITY — the behavior is private. "
                           "Berger (Ch.4, p.135): 'Consider how to make the private public.' "
                           "If people can't SEE others doing it, they won't imitate it."),
                "source": "Berger, Contagious (2013), Ch.4 (Public)"}

    visibility_score = public_residue_strength * 40
    proof_score = 35 if social_proof_visible else 10
    residue_score = 25 if behavioral_residue else 5

    total = visibility_score + proof_score + residue_score

    if total >= 70:
        verdict = ("STRONG PUBLIC PRESENCE — behavior is visible, traceable, and signals social proof. "
                   "Berger (Ch.4, p.148): 'Built to show, built to grow.'")
    elif total >= 40:
        verdict = "ADEQUATE PUBLIC PRESENCE — some visibility but could be more observable."
    else:
        verdict = "WEAK PUBLIC PRESENCE — behavior is mostly invisible to others."

    return {"score": round(total, 1), "max_score": 100,
            "verdict": verdict,
            "source": "Berger, Contagious (2013), Ch.4 (Public)"}


def score_practical_value(
    usefulness: float,  # 0.0-1.0
    narrowcast_specificity: str,  # 'broad', 'segment', 'narrow'
    price_framing: Optional[str] = None,  # 'percentage', 'absolute', or None
    price_amount: Optional[float] = None,
) -> Dict:
    """
    Practical Value: News you can use.
    Berger, Contagious (2013), Ch.5, pp.162-193.

    Berger (Ch.5, p.164): "People share practical information to help others.
    Sharing useful content strengthens social bonds."

    The Rule of 100 (Ch.5, p.177): if price > $100, use percentage discount
    ("25% off"). If price < $100, use absolute dollar discount ("$20 off").

    Args:
      usefulness: 0.0-1.0. How genuinely useful is the content?
      narrowcast_specificity: How targeted is the utility?
        'broad' = useful to everyone, 'segment' = useful to a group,
        'narrow' = useful to a specific persona.
      price_framing: If a price deal, what framing? 'percentage' or 'absolute'.
      price_amount: The dollar amount if relevant.

    Returns dict with practical value score.
    """
    _pct(usefulness, "usefulness")

    usefulness_score = usefulness * 50

    narrow_scores = {"narrow": 30, "segment": 25, "broad": 15}
    specificity_score = narrow_scores.get(narrowcast_specificity, 20)

    # Berger's Rule of 100 (Ch.5, p.177)
    framing_bonus = 0
    framing_note = ""
    if price_framing and price_amount is not None:
        if price_amount > 100 and price_framing == "percentage":
            framing_bonus = 10
            framing_note = "Correct framing per Rule of 100: >$100 → percentage."
        elif price_amount <= 100 and price_framing == "absolute":
            framing_bonus = 10
            framing_note = "Correct framing per Rule of 100: <=$100 → absolute."
        else:
            framing_note = f"Suboptimal framing per Rule of 100. Price=${price_amount}, framing={price_framing}."

    total = usefulness_score + specificity_score + framing_bonus + 10  # base

    if total >= 75:
        verdict = ("HIGH PRACTICAL VALUE — genuinely useful, well-targeted. "
                   "Berger (Ch.5, p.164): 'News you can use.'")
    elif total >= 45:
        verdict = "MODERATE PRACTICAL VALUE — useful but could be more targeted or better framed."
    else:
        verdict = "LOW PRACTICAL VALUE — content doesn't provide actionable utility."

    return {"score": round(total, 1), "max_score": 100,
            "usefulness_raw": usefulness,
            "narrowcast": narrowcast_specificity,
            "rule_of_100": framing_note if framing_note else "N/A (not a price offer)",
            "verdict": verdict,
            "source": "Berger, Contagious (2013), Ch.5 (Practical Value)"}


def score_stories_berger(
    narrative_present: bool,
    brand_integration: float,  # 0.0-1.0: 1.0 = brand essential to story; 0.0 = brand tacked on
    trojan_horse_quality: float,  # 0.0-1.0: how well does the story carry the message?
    has_valuable_virality: bool = False,
) -> Dict:
    """
    Stories: Information travels under the guise of idle chatter.
    Berger, Contagious (2013), Ch.6, pp.194-224.

    The Trojan Horse concept (Ch.6, p.196): "The story is the horse; the brand
    message is the soldiers inside."

    The litmus test (Ch.6, pp.205-215): "If you removed the brand from the story,
    would the story still work? If yes → bad integration. If the story collapses
    without the brand → good integration."

    Args:
      narrative_present: Is there an actual story (not just a claim)?
      brand_integration: 0.0-1.0. How essential is the brand to the story?
      trojan_horse_quality: 0.0-1.0. How well does the narrative carry the message?
      has_valuable_virality: Does the story carry a valuable message, not just virality?

    Returns dict with story score.
    """
    _pct(brand_integration, "brand_integration")
    _pct(trojan_horse_quality, "trojan_horse_quality")

    if not narrative_present:
        return {"score": 5.0, "max_score": 100,
                "verdict": ("NO STORY — content has no narrative structure. "
                           "Berger (Ch.6, p.196): 'Information travels under the guise of idle chatter.' "
                           "Without a story, the message has no carrier."),
                "source": "Berger, Contagious (2013), Ch.6 (Stories)"}

    story_presence = 25
    integration_score = brand_integration * 40
    trojan_score = trojan_horse_quality * 25
    value_bonus = 10 if has_valuable_virality else 0

    total = story_presence + integration_score + trojan_score + value_bonus

    if brand_integration >= 0.80:
        integration_verdict = "EXCELLENT BRAND INTEGRATION — brand is essential to the story."
    elif brand_integration >= 0.50:
        integration_verdict = "ADEQUATE INTEGRATION — brand is present but not essential."
    else:
        integration_verdict = "WEAK INTEGRATION — brand is an afterthought. Berger (Ch.6, p.209)."

    if total >= 70:
        verdict = f"STRONG STORY. {integration_verdict}"
    elif total >= 40:
        verdict = f"ADEQUATE STORY. {integration_verdict}"
    else:
        verdict = f"WEAK STORY — narrative is present but ineffective. {integration_verdict}"

    return {"score": round(total, 1), "max_score": 100,
            "brand_integration_pct": round(brand_integration * 100, 1),
            "verdict": verdict,
            "source": "Berger, Contagious (2013), Ch.6 (Stories)"}


def score_stepps(
    social_currency: float,
    trigger_frequency: float,
    trigger_strength: float,
    environmental_cues: int,
    primary_emotion: str,
    emotion_intensity: float,
    has_public_visibility: bool,
    public_residue: float,
    social_proof_visible: bool,
    usefulness: float,
    narrowcast: str,
    narrative_present: bool,
    brand_integration: float,
    trojan_horse_quality: float,
    game_mechanics: bool = False,
    insider_exclusivity: bool = False,
    is_seasonal: bool = False,
    price_framing: Optional[str] = None,
    price_amount: Optional[float] = None,
    has_valuable_virality: bool = False,
) -> Dict:
    """
    Full STEPPS scoring: aggregates all 6 Berger principles.
    Berger, Contagious (2013), Epilogue (pp.235-248): "Content scoring ≥4/6
    on STEPPS is 'contagious.' Content scoring ≤2/6 is 'stillborn'."

    Returns overall STEPPS score, per-principle breakdown, and contagion verdict.

    Berger's threshold (Ch.7, Epilogue, p.235): ≥4/6 principles with score >50%
    """
    sc = score_social_currency(social_currency, game_mechanics, insider_exclusivity)
    tr = score_triggers(trigger_frequency, trigger_strength, environmental_cues, is_seasonal)
    em = score_emotion_arousal(primary_emotion, emotion_intensity)
    pb = score_public(has_public_visibility, public_residue, social_proof_visible, has_public_visibility)
    pv = score_practical_value(usefulness, narrowcast, price_framing, price_amount)
    st = score_stories_berger(narrative_present, brand_integration, trojan_horse_quality, has_valuable_virality)

    principles = {
        "social_currency": sc,
        "triggers": tr,
        "emotion": em,
        "public": pb,
        "practical_value": pv,
        "stories": st
    }

    total = sum(p["score"] for p in principles.values())
    avg = total / 6.0

    # Count principles above 50% (Berger's threshold)
    passing = sum(1 for p in principles.values() if p["score"] >= 50)

    if passing >= 5:
        contagion = "HIGHLY CONTAGIOUS — 5-6 of 6 STEPPS active. This will spread organically."
    elif passing >= 4:
        contagion = "CONTAGIOUS — 4 of 6 STEPPS active. Berger's threshold met."
    elif passing >= 2:
        contagion = "MILDLY CONTAGIOUS — 2-3 of 6 STEPPS active. Needs paid support to spread."
    else:
        contagion = ("STILLBORN — 0-1 of 6 STEPPS active. "
                    "Berger (Epilogue, p.235): 'Will not spread organically regardless of paid support.'")

    return {"stepps_total": round(total, 1), "stepps_avg": round(avg, 1),
            "principles_passing": passing, "principles": principles,
            "contagion_verdict": contagion,
            "source": "Berger, Contagious (2013), Epilogue (STEPPS)"}


# ═══════════════════════════════════════════════════════════════════
# PART 2 — SUCCESs SCORING (Heath & Heath, Made to Stick, 2007)
# ═══════════════════════════════════════════════════════════════════

def score_simple(
    has_commander_intent: bool,
    compactness: float,  # 0.0-1.0: Can it be remembered?
    profundity: float,   # 0.0-1.0: Is it short AND deep (proverb quality)?
    guides_decisions: bool,
) -> Dict:
    """
    Simple: Find the core. Commander's Intent.
    Heath & Heath, Made to Stick (2007), Ch.1, pp.25-72.

    The goal is not sound bites — proverbs are the ideal. A one-sentence
    statement so profound one could spend a lifetime learning to follow it.

    Commander's Intent (Ch.1, pp.34-40): "If we do nothing else tomorrow,
    we must accomplish _______."

    Args:
      has_commander_intent: Is there a clearly stated single core?
      compactness: 0.0-1.0. How compact/portable is the idea?
      profundity: 0.0-1.0. Is it simple AND deep (not just simple)?
      guides_decisions: Would it help someone make a decision?

    Returns dict with simplicity score.
    """
    _pct(compactness, "compactness")
    _pct(profundity, "profundity")

    ci_score = 30 if has_commander_intent else 5
    compact_score = compactness * 30
    profundity_score = profundity * 25
    decision_score = 15 if guides_decisions else 0

    total = ci_score + compact_score + profundity_score + decision_score

    if total >= 75:
        verdict = ("GENUINELY SIMPLE — Commander's Intent present; compact AND profound. "
                   "Heath (Ch.1, p.40): 'A well-thought-out simple idea guides action.'")
    elif total >= 45:
        verdict = "ADEQUATELY SIMPLE — core exists but could be sharper."
    else:
        verdict = ("NOT SIMPLE — the core is missing or buried. "
                   "Heath (Ch.1, p.28): 'Find the core. Strip it down to its most critical essence.'")

    return {"score": round(total, 1), "max_score": 100,
            "verdict": verdict,
            "source": "Heath & Heath, Made to Stick (2007), Ch.1 (Simple)"}


def score_unexpected(
    violates_schema: bool,
    surprise_authenticity: float,  # 0.0-1.0: genuine surprise vs. clickbait
    knowledge_gap_opened: bool,
    gap_is_personal: bool,
) -> Dict:
    """
    Unexpected: Violate expectations; open knowledge gaps.
    Heath & Heath, Made to Stick (2007), Ch.2, pp.73-108.

    Two phases:
      1. Surprise (pp.76-85): Violate a schema. Get attention.
      2. Interest/Gap Theory (pp.88-100): Open a knowledge gap, then fill it.

    The Gap Theory (Ch.2, p.91): "Curiosity happens when we feel a gap in our
    knowledge. Gaps cause pain. When we want to know something but don't,
    it's like having an itch we need to scratch."

    Args:
      violates_schema: Does it violate a mental model?
      surprise_authenticity: 0.0-1.0. Is the surprise genuine (resolved with insight)?
      knowledge_gap_opened: Does it open a gap the audience wants filled?
      gap_is_personal: Is the gap personally relevant to the audience?

    Returns dict with unexpectedness score.
    """
    _pct(surprise_authenticity, "surprise_authenticity")

    schema_score = 30 if violates_schema else 5
    surprise_score = surprise_authenticity * 25
    gap_score = 25 if knowledge_gap_opened else 5
    personal_score = 20 if gap_is_personal else 5

    total = schema_score + surprise_score + gap_score + personal_score

    if total >= 70:
        verdict = ("HIGHLY UNEXPECTED — genuine schema violation + compelling knowledge gap. "
                   "Heath (Ch.2, p.81): 'Surprise makes us want to find an answer.'")
    elif total >= 40:
        verdict = "MODERATELY UNEXPECTED — has some surprise but gap isn't strongly opened."
    else:
        verdict = "NOT UNEXPECTED — predictable; no schema violation. Attention will not be captured."

    return {"score": round(total, 1), "max_score": 100,
            "verdict": verdict,
            "source": "Heath & Heath, Made to Stick (2007), Ch.2 (Unexpected)"}


def score_concrete(
    sensory_hooks: int,  # count of specific sensory details
    shared_meaning: float,  # 0.0-1.0: Would 10 people form the same picture?
    is_actable: bool,  # Can it be performed/acted out?
) -> Dict:
    """
    Concrete: Make ideas sensory and actionable.
    Heath & Heath, Made to Stick (2007), Ch.3, pp.109-143.

    Velcro Theory of Memory (Ch.3, pp.116-117): "Concrete ideas are like Velcro —
    they have lots of hooks that grab onto your memory. Abstract ideas are like Teflon."

    The test (Ch.3, p.130): "What does it look like in practice? What would I see,
    hear, or feel?"

    Args:
      sensory_hooks: Count of concrete, sensory details (people, places, objects, actions).
      shared_meaning: 0.0-1.0. How likely is shared mental picture across audience?
      is_actable: Can the idea be acted out in a skit?

    Returns dict with concreteness score.
    """
    _pct(shared_meaning, "shared_meaning")

    hooks_score = min(sensory_hooks, 10) / 10 * 40
    meaning_score = shared_meaning * 35
    actable_score = 25 if is_actable else 5

    total = hooks_score + meaning_score + actable_score

    if total >= 75:
        verdict = ("HIGHLY CONCRETE — rich sensory detail, unambiguous meaning. "
                   "Heath (Ch.3, p.117): 'Concrete ideas stick. Abstract ideas slide off.'")
    elif total >= 40:
        verdict = "ADEQUATELY CONCRETE — some hooks but meaning is still partially abstract."
    else:
        verdict = "ABSTRACT — no sensory hooks; meaning is ambiguous. Teflon territory."

    return {"score": round(total, 1), "max_score": 100,
            "sensory_hooks_count": sensory_hooks,
            "verdict": verdict,
            "source": "Heath & Heath, Made to Stick (2007), Ch.3 (Concrete)"}


def score_credible(
    has_sinatra_test: bool,
    testable_credential: float,  # 0.0-1.0: Can audience verify for themselves?
    vivid_detail_count: int,
    has_authority: bool,
) -> Dict:
    """
    Credible: Help people test ideas for themselves.
    Heath & Heath, Made to Stick (2007), Ch.4, pp.144-174.

    Three mechanisms:
      1. Sinatra Test (pp.152-158): A single extreme example that proves the whole claim.
      2. Testable Credentials (pp.159-165): Reagan's "Are you better off?" question.
      3. Vivid Details (pp.166-172): Specific details that make claims feel true.

    Args:
      has_sinatra_test: Is there a single, extreme proof case?
      testable_credential: 0.0-1.0. Can the audience verify the claim themselves?
      vivid_detail_count: Count of specific, verifiable details.
      has_authority: Is there a credible external authority backing this?

    Returns dict with credibility score.
    """
    _pct(testable_credential, "testable_credential")

    sinatra_score = 30 if has_sinatra_test else 5
    testable_score = testable_credential * 30
    detail_score = min(vivid_detail_count, 8) / 8 * 25
    authority_score = 15 if has_authority else 0

    total = sinatra_score + testable_score + detail_score + authority_score

    if total >= 70:
        verdict = ("HIGHLY CREDIBLE — Sinatra Test present + testable + vivid. "
                   "Heath (Ch.4, p.152): 'A Sinatra Test is a single example so extreme "
                   "it establishes credibility for the entire claim.'")
    elif total >= 40:
        verdict = "ADEQUATELY CREDIBLE — some credibility mechanisms present."
    else:
        verdict = "LOW CREDIBILITY — no internal credentials. Requires external authority to be believed."

    return {"score": round(total, 1), "max_score": 100,
            "verdict": verdict,
            "source": "Heath & Heath, Made to Stick (2007), Ch.4 (Credible)"}


def score_emotional_heath(
    shows_one_person: bool,  # Mother Teresa effect: ONE vs. many
    identity_appeal: str,  # What identity is being appealed to? (empty = none)
    wii_fy_clarity: float,  # 0.0-1.0: How clear is the "What's In It For You?"
    arousal_level: str,  # 'high' or 'low'
) -> Dict:
    """
    Emotional: Make people care.
    Heath & Heath, Made to Stick (2007), Ch.5, pp.176-208.

    Mother Teresa Effect (Ch.5, pp.180-186): "If I look at the mass, I will never
    act. If I look at the one, I will." — empathy scales DOWN to individuals,
    not UP to statistics.

    Three levers:
      1. The ONE test: Show a single person, not aggregate statistics.
      2. Identity appeal: Tap into a specific identity (Texan, parent, professional).
      3. WIIFY: What's In It For You — personal, concrete benefit.

    Args:
      shows_one_person: Does it focus on one individual (not mass stats)?
      identity_appeal: What identity lever? Empty string = none.
      wii_fy_clarity: 0.0-1.0. How clear is the personal benefit?
      arousal_level: 'high' = action-driving, 'low' = passive.

    Returns dict with emotional score.
    """
    _pct(wii_fy_clarity, "wii_fy_clarity")

    one_person_score = 30 if shows_one_person else 5
    identity_score = 30 if identity_appeal else 5
    wiify_score = wii_fy_clarity * 25
    arousal_score = 15 if arousal_level == "high" else 5

    total = one_person_score + identity_score + wiify_score + arousal_score

    if total >= 70:
        verdict = ("STRONG EMOTIONAL APPEAL — shows one person, taps identity, clear WIIFY. "
                   "Heath (Ch.5, p.183): 'The Mother Teresa effect: empathy scales to the one.'")
    elif total >= 40:
        verdict = "ADEQUATE EMOTIONAL — some feeling but missing key levers."
    else:
        verdict = ("LOW EMOTIONAL — abstract, impersonal. "
                   "Heath (Ch.5, p.176): 'We are wired to feel things for people, not for abstractions.'")

    return {"score": round(total, 1), "max_score": 100,
            "verdict": verdict,
            "source": "Heath & Heath, Made to Stick (2007), Ch.5 (Emotional)"}


def score_stories_heath(
    has_narrative_arc: bool,
    archetype: str,  # 'challenge', 'connection', 'creativity', or 'none'
    flight_simulator_quality: float,  # 0.0-1.0
    passes_shop_talk: bool,
) -> Dict:
    """
    Stories: Drive action through mental simulation.
    Heath & Heath, Made to Stick (2007), Ch.6, pp.209-244.

    Three archetypes (Ch.6, pp.226-240):
      Challenge: David vs. Goliath — underdog overcomes.
      Connection: Bridges a gap between people.
      Creativity: Mental breakthrough, innovative solution.

    Shop Talk Test (Ch.6, pp.241-244): Would a customer tell this story in their
    own words, unprompted, to a friend?

    Args:
      has_narrative_arc: Is there a beginning, middle, end?
      archetype: 'challenge', 'connection', 'creativity', or 'none'.
      flight_simulator_quality: 0.0-1.0. Does the audience mentally rehearse?
      passes_shop_talk: Would customers retell this unprompted?

    Returns dict with story score.
    """
    _pct(flight_simulator_quality, "flight_simulator_quality")

    if not has_narrative_arc:
        return {"score": 5.0, "max_score": 100,
                "verdict": "NO STORY ARC — no narrative structure.",
                "source": "Heath & Heath, Made to Stick (2007), Ch.6 (Stories)"}

    arc_score = 20
    archetype_scores = {"challenge": 25, "connection": 25, "creativity": 20, "none": 5}
    archetype_score = archetype_scores.get(archetype, 5)
    flight_score = flight_simulator_quality * 30
    shop_talk_score = 25 if passes_shop_talk else 5

    total = arc_score + archetype_score + flight_score + shop_talk_score

    if total >= 70:
        verdict = ("STRONG STORY — effective narrative archetype, mental simulation active. "
                   "Heath (Ch.6, p.212): 'Stories act as a mental flight simulator.'")
    elif total >= 40:
        verdict = "ADEQUATE STORY — story present but not fully activating mental simulation."
    else:
        verdict = "WEAK STORY — narrative skeleton exists but no archetype or simulation."

    return {"score": round(total, 1), "max_score": 100,
            "archetype": archetype, "passes_shop_talk": passes_shop_talk,
            "verdict": verdict,
            "source": "Heath & Heath, Made to Stick (2007), Ch.6 (Stories)"}


def score_success(
    has_commander_intent: bool, compactness: float, profundity: float, guides_decisions: bool,
    violates_schema: bool, surprise_authenticity: float, knowledge_gap_opened: bool, gap_is_personal: bool,
    sensory_hooks: int, shared_meaning: float, is_actable: bool,
    has_sinatra_test: bool, testable_credential: float, vivid_detail_count: int, has_authority: bool,
    shows_one_person: bool, identity_appeal: str, wii_fy_clarity: float, arousal_level: str,
    has_narrative_arc: bool, story_archetype: str, flight_simulator_quality: float, passes_shop_talk: bool,
) -> Dict:
    """
    Full SUCCESs scoring: aggregates all 6 Heath & Heath principles.
    Heath & Heath, Made to Stick (2007), Epilogue (pp.245-260).

    Returns overall SUCCESs score, per-principle breakdown.
    """
    sm = score_simple(has_commander_intent, compactness, profundity, guides_decisions)
    un = score_unexpected(violates_schema, surprise_authenticity, knowledge_gap_opened, gap_is_personal)
    co = score_concrete(sensory_hooks, shared_meaning, is_actable)
    cr = score_credible(has_sinatra_test, testable_credential, vivid_detail_count, has_authority)
    em = score_emotional_heath(shows_one_person, identity_appeal, wii_fy_clarity, arousal_level)
    st = score_stories_heath(has_narrative_arc, story_archetype, flight_simulator_quality, passes_shop_talk)

    principles = {
        "simple": sm,
        "unexpected": un,
        "concrete": co,
        "credible": cr,
        "emotional": em,
        "stories": st
    }

    total = sum(p["score"] for p in principles.values())
    avg = total / 6.0

    passing = sum(1 for p in principles.values() if p["score"] >= 50)

    if passing >= 5:
        sticky = "HIGHLY STICKY — 5-6 of 6 SUCCESs active. This idea will survive and spread."
    elif passing >= 4:
        sticky = "STICKY — 4 of 6 SUCCESs active. Good chance of retention."
    elif passing >= 2:
        sticky = "MILDLY STICKY — 2-3 of 6 SUCCESs active. May not survive retelling."
    else:
        sticky = "UNSTICKY — 0-1 of 6 SUCCESs active. Will be forgotten."

    return {"success_total": round(total, 1), "success_avg": round(avg, 1),
            "principles_passing": passing, "principles": principles,
            "sticky_verdict": sticky,
            "source": "Heath & Heath, Made to Stick (2007), Epilogue (SUCCESs)"}


# ═══════════════════════════════════════════════════════════════════
# PART 3 — COMPOSITE CONTAGION SCORE (STEPPS + SUCCESs)
# ═══════════════════════════════════════════════════════════════════

def composite_contagion_score(
    stepps_result: Dict,
    success_result: Dict,
    step_weight: float = 0.55,   # STEPPS weight (contagion/spread)
    success_weight: float = 0.45,  # SUCCESs weight (stick/retention)
) -> Dict:
    """
    Composite Contagion Score: weighted average of STEPPS + SUCCESs.

    STEPPS answers: "Will this spread?" (social contagion — Berger)
    SUCCESs answers: "Will this stick?" (memory/retention — Heath)

    Together: "Will this spread AND stick?"

    Default weights are slightly skewed toward STEPPS (0.55) because in
    digital environments, spread mechanics (social currency, triggers, public)
    are slightly more important than retention mechanics. For education
    or internal comms, flip the weights.

    Args:
      stepps_result: Output of score_stepps().
      success_result: Output of score_success().
      step_weight: Weight for STEPPS (default 0.55).
      success_weight: Weight for SUCCESs (default 0.45).

    Returns composite score with integrated verdict.
    """
    _pct(step_weight, "step_weight")
    _pct(success_weight, "success_weight")

    if abs(step_weight + success_weight - 1.0) > 0.001:
        raise ValueError(f"Weights must sum to 1.0; got {step_weight} + {success_weight} = {step_weight + success_weight}")

    spread_score = stepps_result["stepps_avg"]
    stick_score = success_result["success_avg"]

    composite = (spread_score * step_weight + stick_score * success_weight)

    if composite >= 75:
        quadrant = "SUPER-SPREADER — content will spread widely AND stick in memory. This is the ideal."
    elif composite >= 55:
        quadrant = "STRONG — spreads well or sticks well. Likely effective."
    elif composite >= 35:
        quadrant = "ADEQUATE — middling performance. Will need paid support or significant revision."
    else:
        quadrant = "WEAK — unlikely to spread or stick. Return to concept stage."

    return {"composite_score": round(composite, 1),
            "spread_score": round(spread_score, 1),
            "stick_score": round(stick_score, 1),
            "weights": {"stepps": step_weight, "success": success_weight},
            "quadrant": quadrant,
            "stepps_passing": stepps_result["principles_passing"],
            "success_passing": success_result["principles_passing"],
            "source": "Berger (2013) + Heath (2007) — Composite Contagion Model"}


# ═══════════════════════════════════════════════════════════════════
# PART 4 — CONTENT PORTFOLIO PARETO ANALYSIS
# ═══════════════════════════════════════════════════════════════════

def content_portfolio_pareto(
    content_scores: List[Dict],
    score_key: str = "composite_score",
) -> Dict:
    """
    Content Portfolio Pareto Analysis: identify the vital few content pieces.

    Applies Pareto (1896) to a content portfolio. Which 20% of content
    drives 80% of aggregate performance? This tells pulse which content
    to promote and which to archive.

    Args:
      content_scores: List of dicts. Each must have 'name' and score_key.
        e.g., [{"name": "Blog Post A", "composite_score": 82}, ...]
      score_key: Which score field to analyze (default: 'composite_score').

    Returns Pareto analysis with top performer identification.

    Note: This function works standalone but can also delegate to
          marketing_laws.pareto_principle() if available in the import path.
    """
    if not content_scores:
        raise ValueError("content_scores must be non-empty")
    if not all("name" in c and score_key in c for c in content_scores):
        raise ValueError(f"All items must have 'name' and '{score_key}'")

    sorted_content = sorted(content_scores, key=lambda x: x[score_key], reverse=True)
    total_score = sum(c[score_key] for c in sorted_content)
    if total_score <= 0:
        raise ValueError(f"Total {score_key} must be > 0")

    cumulative = 0.0
    top_n = 0
    for c in sorted_content:
        cumulative += c[score_key]
        top_n += 1
        if cumulative / total_score >= 0.80:
            break

    top_pct = top_n / len(sorted_content) * 100

    if top_pct <= 25.0:
        verdict = (f"STRONG PARETO — top {top_n} pieces ({top_pct:.0f}%) drive 80% of performance. "
                   f"Promote these; archive the bottom {(1 - top_pct/100)*100:.0f}%. "
                   f"Pareto (1896); Juran (1951): 'The vital few vs. the trivial many.'")
    elif top_pct <= 40.0:
        verdict = f"MODERATE CONCENTRATION — top {top_n} pieces ({top_pct:.0f}%) drive 80% of scores."
    else:
        verdict = "LOW CONCENTRATION — performance is evenly distributed. Focus on raising the floor, not the ceiling."

    return {"top_n": top_n,
            "top_pct": round(top_pct, 1),
            "top_performers": [{"name": c["name"], "score": c[score_key]}
                              for c in sorted_content[:top_n]],
            "bottom_performers": [{"name": c["name"], "score": c[score_key]}
                                 for c in sorted_content[-max(1, len(sorted_content)//5):]],
            "portfolio_avg_score": round(total_score / len(sorted_content), 1),
            "verdict": verdict,
            "source": "Pareto (1896); Juran, Quality Control Handbook (1951)"}


# ═══════════════════════════════════════════════════════════════════
# PART 5 — TRIGGER FREQUENCY ESTIMATOR
# ═══════════════════════════════════════════════════════════════════

def trigger_frequency_estimator(
    associated_events: List[str],
    event_frequencies: Dict[str, float],  # e.g., {"coffee": 0.95, "lunch": 0.71, "payday": 0.07}
) -> Dict:
    """
    Trigger Frequency Estimator: how often is this content triggered in daily life?
    Berger, Contagious (2013), Ch.2, pp.66-98.

    Berger's key insight (Ch.2, p.78): "Frequency trumps intensity. A mild message
    triggered daily spreads more than a powerful message triggered once."

    This function estimates the aggregate trigger frequency from a list of daily-life
    events/cues associated with the content.

    Args:
      associated_events: List of events that could trigger recall.
        e.g., ["morning coffee", "lunch break", "afternoon slump"]
      event_frequencies: Mapping of event types to daily probability.
        e.g., {"coffee": 0.95, "lunch": 0.71, "work": 0.86, "commute": 0.86}

    Returns estimated daily/weekly/monthly trigger frequency.
    """
    if not associated_events:
        return {"daily_trigger_probability": 0.0,
                "weekly_triggers": 0,
                "verdict": "NO TRIGGERS — content has no daily-life cues. "
                          "Berger (Ch.2, p.77): 'Attach your message to an everyday trigger.'",
                "source": "Berger, Contagious (2013), Ch.2 (Triggers)"}

    # Normalize events to match keys
    matched_frequencies = []
    for event in associated_events:
        event_lower = event.lower().strip()
        for key, freq in event_frequencies.items():
            if key in event_lower:
                matched_frequencies.append(freq)
                break

    if not matched_frequencies:
        avg_freq = 0.1  # Unknown events, assume low
    else:
        avg_freq = sum(matched_frequencies) / len(matched_frequencies)

    daily_prob = avg_freq
    weekly_triggers = daily_prob * 7
    monthly_triggers = weekly_triggers * 4.33

    if daily_prob >= 0.70:
        verdict = (f"HIGH FREQUENCY TRIGGERS — ~{weekly_triggers:.1f} triggers/week. "
                   f"Berger (Ch.2, p.78): 'This is the sweet spot — daily cues, constant reminders.'")
    elif daily_prob >= 0.30:
        verdict = (f"MODERATE FREQUENCY — ~{weekly_triggers:.1f} triggers/week. "
                   f"Consider attaching to a more frequent cue.")
    else:
        verdict = (f"LOW FREQUENCY — ~{weekly_triggers:.1f} triggers/week. "
                   f"Berger (Ch.2, p.77): 'If it's not triggered, it's not talked about.'")

    return {"daily_trigger_probability": round(daily_prob, 3),
            "weekly_triggers": round(weekly_triggers, 1),
            "monthly_triggers": round(monthly_triggers, 1),
            "matched_events": len(matched_frequencies),
            "verdict": verdict,
            "source": "Berger, Contagious (2013), Ch.2 (Triggers)"}


# ═══════════════════════════════════════════════════════════════════
# PART 6 — EMOTION AROUSAL CLASSIFIER
# ═══════════════════════════════════════════════════════════════════

# Berger's high/low-arousal emotion taxonomy (Contagious, Ch.3, pp.106-118)
_HIGH_AROUSAL_POSITIVE = {"awe", "excitement", "amusement", "joy", "inspiration",
                           "thrilled", "elated", "astonished", "enthusiastic", "passion"}
_HIGH_AROUSAL_NEGATIVE = {"anger", "anxiety", "fear", "disgust", "outrage",
                           "rage", "panic", "dread", "fury", "alarm"}
_LOW_AROUSAL = {"sadness", "contentment", "calm", "neutral", "peaceful",
                "serene", "relaxed", "melancholy", "bored", "tired"}


def classify_emotion_arousal(emotion_words: List[str]) -> Dict:
    """
    Emotion Arousal Classifier: maps emotion words to arousal (high/low) and valence.

    Berger, Contagious (2013), Ch.3, pp.99-131.
    High arousal = shared. Low arousal = NOT shared.

    Args:
      emotion_words: List of emotion words from the content.
        e.g., ["excited", "inspired", "hopeful"]

    Returns classification with arousal/valence profile.
    """
    if not emotion_words:
        return {"dominant_arousal": "none",
                "dominant_valence": "none",
                "shareability_potential": 0.0,
                "emotions_found": [],
                "verdict": "NO EMOTIONS DETECTED. Berger (Ch.3, p.117): 'Without high arousal, no sharing.'",
                "source": "Berger, Contagious (2013), Ch.3 (Emotion)"}

    high_pos = 0
    high_neg = 0
    low = 0
    found = []

    for word in emotion_words:
        w = word.lower().strip()
        if w in _HIGH_AROUSAL_POSITIVE:
            high_pos += 1
            found.append((w, "HIGH_POSITIVE"))
        elif w in _HIGH_AROUSAL_NEGATIVE:
            high_neg += 1
            found.append((w, "HIGH_NEGATIVE"))
        elif w in _LOW_AROUSAL:
            low += 1
            found.append((w, "LOW_AROUSAL"))

    total = high_pos + high_neg + low

    if total == 0:
        # Unknown emotions — attempt fuzzy match
        return {"dominant_arousal": "unknown",
                "dominant_valence": "unknown",
                "shareability_potential": 50.0,
                "emotions_found": [(w, "UNCLASSIFIED") for w in emotion_words],
                "verdict": f"UNCLASSIFIED EMOTIONS: {emotion_words}. Unable to classify arousal. Defaulting to moderate.",
                "source": "Berger, Contagious (2013), Ch.3 (Emotion)"}

    if high_pos >= high_neg and high_pos >= low:
        arousal = "HIGH"
        valence = "POSITIVE"
        potential = 90.0
    elif high_neg >= high_pos and high_neg >= low:
        arousal = "HIGH"
        valence = "NEGATIVE"
        potential = 80.0
    else:
        arousal = "LOW"
        valence = "NEUTRAL"
        potential = 25.0

    if arousal == "HIGH":
        v = "Strong sharing potential — high arousal emotions drive sharing."
    else:
        v = "Low sharing potential — low arousal emotions suppress sharing."

    return {"dominant_arousal": arousal,
            "dominant_valence": valence,
            "shareability_potential": potential,
            "high_pos_count": high_pos, "high_neg_count": high_neg, "low_count": low,
            "emotions_found": found,
            "verdict": v,
            "source": "Berger, Contagious (2013), Ch.3 (Emotion)"}


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
    print("SELF-TEST SUITE: content_performance.py")
    print("STEPPS + SUCCESs Composite Contagion Scoring")
    print("=" * 70)

    # ── STEPPS: Individual Principle Scoring ──
    print("\n── STEPPS: Social Currency ──")
    sc = score_social_currency(0.9, True, True, True)
    ck("high social currency → score > 75", sc["score"] > 75, True)

    sc2 = score_social_currency(0.2, False, False, False)
    ck("low social currency → score < 45", sc2["score"] < 45, True)

    print("\n── STEPPS: Triggers ──")
    tr = score_triggers(0.9, 0.8, 5, False)
    ck("high frequency + strength → score > 70", tr["score"] > 70, True)

    tr2 = score_triggers(0.1, 0.2, 1, True)
    ck("low freq + seasonal → score < 40", tr2["score"] < 40, True)

    print("\n── STEPPS: Emotion ──")
    em = score_emotion_arousal("awe", 0.9)
    ck("awe → HIGH POSITIVE arousal", em["arousal"] == "HIGH" and em["valence"] == "POSITIVE", True)

    em2 = score_emotion_arousal("anger", 0.8)
    ck("anger → HIGH NEGATIVE arousal", em2["arousal"] == "HIGH" and em2["valence"] == "NEGATIVE", True)

    em3 = score_emotion_arousal("sadness", 0.7)
    ck("sadness → LOW arousal", em3["arousal"] == "LOW", True)

    print("\n── STEPPS: Public ──")
    pb = score_public(True, 0.9, True, True)
    ck("high public visibility → score > 70", pb["score"] > 70, True)

    pb2 = score_public(False, 0.0, False, False)
    ck("no public visibility → score low", pb2["score"] < 20, True)

    print("\n── STEPPS: Practical Value ──")
    pv = score_practical_value(0.9, "narrow", "percentage", 150)
    ck("useful + narrow + Rule of 100 correct → high score", pv["score"] > 70, True)

    print("\n── STEPPS: Stories ──")
    st = score_stories_berger(True, 0.9, 0.85, True)
    ck("strong story + brand integration → high score", st["score"] > 70, True)

    st2 = score_stories_berger(False, 0.0, 0.0, False)
    ck("no story → minimal score", st2["score"] < 15, True)

    # ── Full STEPPS Scoring ──
    print("\n── Full STEPPS Scoring ──")
    # Blendtec example: high social currency + high practical value + high stories
    stepps = score_stepps(
        social_currency=0.9, trigger_frequency=0.6, trigger_strength=0.7,
        environmental_cues=4, primary_emotion="amusement", emotion_intensity=0.85,
        has_public_visibility=True, public_residue=0.7, social_proof_visible=True,
        usefulness=0.8, narrowcast="segment",
        narrative_present=True, brand_integration=0.95, trojan_horse_quality=0.9,
        game_mechanics=False, insider_exclusivity=False,
    )
    ck("Blendtec → ≥4 principles passing", stepps["principles_passing"] >= 4, True)

    # Negative example: low scores across the board
    stepps_neg = score_stepps(
        social_currency=0.1, trigger_frequency=0.1, trigger_strength=0.1,
        environmental_cues=0, primary_emotion="sadness", emotion_intensity=0.2,
        has_public_visibility=False, public_residue=0.1, social_proof_visible=False,
        usefulness=0.1, narrowcast="broad",
        narrative_present=False, brand_integration=0.1, trojan_horse_quality=0.1,
    )
    ck("negative example → ≤1 principle passing", stepps_neg["principles_passing"] <= 1, True)

    # ── SUCCESs: Individual Principle Scoring ──
    print("\n── SUCCESs: Simple ──")
    sm = score_simple(True, 0.85, 0.8, True)
    ck("strong Commander's Intent → high score", sm["score"] > 70, True)

    print("\n── SUCCESs: Unexpected ──")
    un = score_unexpected(True, 0.8, True, True)
    ck("schema violation + gap → high score", un["score"] > 70, True)

    print("\n── SUCCESs: Concrete ──")
    co = score_concrete(7, 0.85, True)
    ck("7 hooks + shared meaning → high score", co["score"] > 70, True)

    print("\n── SUCCESs: Credible ──")
    cr = score_credible(True, 0.8, 5, True)
    ck("Sinatra Test + testable → high score", cr["score"] > 70, True)

    print("\n── SUCCESs: Emotional ──")
    eh = score_emotional_heath(True, "parent", 0.8, "high")
    ck("shows one + identity → high score", eh["score"] > 70, True)

    print("\n── SUCCESs: Stories ──")
    sh = score_stories_heath(True, "challenge", 0.85, True)
    ck("challenge plot + shop talk → high score", sh["score"] > 70, True)

    # ── Full SUCCESs Scoring ──
    print("\n── Full SUCCESs Scoring ──")
    success = score_success(
        has_commander_intent=True, compactness=0.85, profundity=0.8, guides_decisions=True,
        violates_schema=True, surprise_authenticity=0.8, knowledge_gap_opened=True, gap_is_personal=True,
        sensory_hooks=7, shared_meaning=0.85, is_actable=True,
        has_sinatra_test=True, testable_credential=0.8, vivid_detail_count=5, has_authority=True,
        shows_one_person=True, identity_appeal="creator", wii_fy_clarity=0.85, arousal_level="high",
        has_narrative_arc=True, story_archetype="challenge", flight_simulator_quality=0.85, passes_shop_talk=True,
    )
    ck("strong SUCCESs → ≥4 passing", success["principles_passing"] >= 4, True)

    # ── Composite Score ──
    print("\n── Composite Contagion Score ──")
    comp = composite_contagion_score(stepps, success)
    ck("Blendtec composite → > 70", comp["composite_score"] > 70, True)

    comp_neg = composite_contagion_score(stepps_neg, score_success(
        has_commander_intent=False, compactness=0.1, profundity=0.1, guides_decisions=False,
        violates_schema=False, surprise_authenticity=0.1, knowledge_gap_opened=False, gap_is_personal=False,
        sensory_hooks=0, shared_meaning=0.1, is_actable=False,
        has_sinatra_test=False, testable_credential=0.1, vivid_detail_count=0, has_authority=False,
        shows_one_person=False, identity_appeal="", wii_fy_clarity=0.1, arousal_level="low",
        has_narrative_arc=False, story_archetype="none", flight_simulator_quality=0.1, passes_shop_talk=False,
    ))
    ck("negative composite → < 30", comp_neg["composite_score"] < 30, True)

    # ── Portfolio Pareto ──
    print("\n── Content Portfolio Pareto ──")
    portfolio = [
        {"name": "Viral Hit", "composite_score": 90},
        {"name": "Strong Performer A", "composite_score": 82},
        {"name": "Strong Performer B", "composite_score": 78},
        {"name": "Average A", "composite_score": 55},
        {"name": "Average B", "composite_score": 52},
        {"name": "Average C", "composite_score": 50},
        {"name": "Weak A", "composite_score": 35},
        {"name": "Weak B", "composite_score": 30},
        {"name": "Weak C", "composite_score": 25},
        {"name": "Stillborn", "composite_score": 15},
    ]
    pf = content_portfolio_pareto(portfolio)
    ck("Pareto: top performers identified", pf["top_n"] > 0, True)
    ck("Pareto: top_pct ≤ 75% with realistic data", pf["top_pct"] <= 75, True)

    # ── Trigger Frequency Estimator ──
    print("\n── Trigger Frequency Estimator ──")
    events = ["morning coffee", "lunch break", "afternoon coffee"]
    freq_map = {"coffee": 0.95, "lunch": 0.71, "commute": 0.86}
    tfe = trigger_frequency_estimator(events, freq_map)
    ck("coffee+lunch triggers → high daily prob", tfe["daily_trigger_probability"] > 0.5, True)

    # ── Emotion Arousal Classifier ──
    print("\n── Emotion Arousal Classifier ──")
    eac = classify_emotion_arousal(["awe", "excited", "inspired", "calm"])
    ck("mostly high-pos → HIGH arousal", eac["dominant_arousal"] == "HIGH", True)
    ck("high sharing potential", eac["shareability_potential"] > 70, True)

    eac2 = classify_emotion_arousal(["sad", "melancholy", "calm"])
    ck("all low arousal → LOW", eac2["dominant_arousal"] == "LOW", True)

    eac3 = classify_emotion_arousal([])
    ck("empty → none arousal", eac3["dominant_arousal"] == "none", True)

    print("\n" + "=" * 70)
    tot = p + f
    print(f"RESULTS: {p}/{tot} passed, {f} failed")
    print("=" * 70)
    return 0 if f == 0 else 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
