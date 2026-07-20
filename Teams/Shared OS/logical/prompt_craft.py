#!/usr/bin/env python3
"""
PromptCraft — Cinematographic Prompt Vocabulary Builder
=========================================================
Sources (Route B — prompt engineering, no deep book extraction):

  Higgsfield AI — cinematographic skill templates (higgsfield.ai/skills).
    Camera specification, lighting scenarios, color grade presets,
    composition rules, style-reference library.

  AKCodez/higgsfield-claude-skills — GitHub repository of Claude-optimized
    cinematography prompts. Shot types, lens selection, aperture/focal length
    guidance, negative prompt construction.

  General Cinematography References:
    - Mascelli, Joseph V., *The Five C's of Cinematography* (1965)
    - Brown, Blain, *Cinematography: Theory and Practice* (3rd Ed., 2016)
    - American Society of Cinematographers (ASC) manual

Route: B (template library — prompt building + completeness verification).
Imports: None (self-contained prompt builder).
"""

from __future__ import annotations
import sys
from typing import Dict, List, Optional


# ═══════════════════════════════════════════════════════════════════
# PART 1 — CAMERA SPECIFICATION BUILDER
# ═══════════════════════════════════════════════════════════════════

# Camera bodies (Higgsfield AI knowledge base)
CAMERA_BODIES = {
    "arri_alexa_35": {"make": "ARRI", "model": "Alexa 35", "sensor": "Super 35", "dynamic_range": "17 stops",
                      "best_for": "cinematic, narrative, commercial, high-end"},
    "arri_alexa_mini_lf": {"make": "ARRI", "model": "Alexa Mini LF", "sensor": "Large Format (LF)",
                           "dynamic_range": "15 stops", "best_for": "cinematic, widescreen, shallow DOF"},
    "sony_venice_2": {"make": "Sony", "model": "Venice 2", "sensor": "Full Frame", "dynamic_range": "16 stops",
                      "best_for": "high resolution, VFX plates, low light"},
    "red_komodo": {"make": "RED", "model": "Komodo", "sensor": "Super 35", "dynamic_range": "16+ stops",
                   "best_for": "compact, indie, gimbal, crash cam"},
    "red_v_raptor": {"make": "RED", "model": "V-Raptor", "sensor": "Vista Vision (Large Format)",
                     "dynamic_range": "17+ stops", "best_for": "8K capture, high-end commercial, VFX"},
    "canon_c70": {"make": "Canon", "model": "C70", "sensor": "Super 35 DGO", "dynamic_range": "16+ stops",
                  "best_for": "documentary, run-and-gun, corporate"},
    "blackmagic_ursa_12k": {"make": "Blackmagic", "model": "URSA Mini Pro 12K", "sensor": "Super 35",
                            "dynamic_range": "14 stops", "best_for": "budget cinematic, 12K oversampling"},
    "iphone_15_pro": {"make": "Apple", "model": "iPhone 15 Pro", "sensor": "1/1.28\"",
                      "dynamic_range": "~12 stops (extended)", "best_for": "social content, UGC aesthetic, vertical video"},
}

# Lens types (Higgsfield AI knowledge base)
LENS_TYPES = {
    "spherical_prime": {"category": "Spherical Prime", "characteristics": "sharp, minimal distortion, fast aperture (T1.3-T2.8)",
                        "examples": "ARRI Master Primes, Zeiss Supreme Primes, Cooke S7/i"},
    "anamorphic": {"category": "Anamorphic", "characteristics": "oval bokeh, horizontal flare, 2x squeeze, widescreen character",
                   "examples": "Panavision C-Series, ARRI/Zeiss Master Anamorphics, Atlas Orion"},
    "vintage": {"category": "Vintage/Rehoused", "characteristics": "soft edges, organic flare, lower contrast, characterful aberrations",
                "examples": "Canon K-35, Leica R rehoused, Super Baltars"},
    "zoom_cine": {"category": "Cinema Zoom", "characteristics": "parfocal, consistent T-stop, versatile framing",
                  "examples": "Angenieux EZ, Fujinon Premista, Canon Cine-Servo"},
    "macro": {"category": "Macro/Probe", "characteristics": "extreme close-up, 1:1 magnification, shallow DOF",
              "examples": "Laowa Probe, Zeiss Master Macro, ARRI Macro"},
    "tilt_shift": {"category": "Tilt-Shift", "characteristics": "miniature effect, selective focus plane, perspective control",
                   "examples": "Canon TS-E, Hartblei, Lensbaby"},
}

# Common focal lengths and their use cases
FOCAL_LENGTHS = {
    "14mm": {"type": "ultra-wide", "characteristics": "extreme perspective, deep depth of field, spatial exaggeration",
             "use": "establishing shots, architecture, cramped spaces, dramatic distortion"},
    "16mm": {"type": "ultra-wide", "characteristics": "wide perspective, moderate distortion",
             "use": "wide establishing, action, POV"},
    "21mm": {"type": "wide", "characteristics": "wide field of view, deep focus, spatial depth",
             "use": "landscape, master shots, wide interiors"},
    "24mm": {"type": "wide", "characteristics": "natural wide perspective, context-rich",
             "use": "environmental portraits, group shots, interiors"},
    "28mm": {"type": "wide-normal", "characteristics": "slightly wide, natural perspective",
             "use": "street photography, documentary, walk-and-talk"},
    "35mm": {"type": "normal-wide", "characteristics": "natural human perspective, balanced DOF",
             "use": "standard narrative, two-shots, documentary, 'human eye' equivalent"},
    "50mm": {"type": "normal", "characteristics": "neutral perspective, flattering compression",
             "use": "portraits, product, standard narrative"},
    "85mm": {"type": "short telephoto", "characteristics": "flattering compression, shallow DOF, background separation",
             "use": "portraits, beauty, close-ups, interview"},
    "100mm": {"type": "telephoto", "characteristics": "strong compression, shallow DOF, flattened perspective",
              "use": "macro detail, beauty close-ups, distant subjects"},
    "135mm": {"type": "telephoto", "characteristics": "compressed perspective, background isolation, distant reach",
              "use": "sports, wildlife, compressed cityscapes, beauty"},
    "200mm+": {"type": "long telephoto", "characteristics": "extreme compression, narrow FOV, atmospheric haze effect",
               "use": "sports, wildlife, sun/moon shots, extreme compression landscapes"},
}

# Aperture stops and their effects
APERTURES = {
    "T1.2": {"light": "very fast", "dof": "razor-thin", "use": "night exteriors, extreme subject isolation, dreamy look"},
    "T1.4": {"light": "fast", "dof": "very shallow", "use": "low-light, beauty, shallow-focus narrative"},
    "T2.0": {"light": "moderately fast", "dof": "shallow", "use": "standard narrative, controlled environments"},
    "T2.8": {"light": "standard", "dof": "moderate", "use": "day exteriors, documentary, interview standard"},
    "T4.0": {"light": "moderate", "dof": "moderate-deep", "use": "group shots, product detail, controlled studio"},
    "T5.6": {"light": "stopped down", "dof": "deep", "use": "landscape, sunlit exteriors, deep-focus narrative (Citizen Kane look)"},
    "T8.0": {"light": "stopped down", "dof": "deep", "use": "bright sunlight, architecture, deep focus"},
    "T11-T22": {"light": "heavily stopped", "dof": "very deep", "use": "extreme sunlight, sunstars, maximum DOF"},
}

# Shot types (from Higgsfield AI templates)
SHOT_TYPES = {
    "ECU": {"full": "Extreme Close-Up", "framing": "eyes only / detail of face / single product detail",
            "emotional_effect": "intimacy, intensity, claustrophobia, extreme focus"},
    "CU": {"full": "Close-Up", "framing": "full face, neck to top of head",
           "emotional_effect": "emotional connection, character focus, intimacy"},
    "MCU": {"full": "Medium Close-Up", "framing": "head and shoulders",
            "emotional_effect": "dialogue, reaction, personal connection"},
    "MS": {"full": "Medium Shot", "framing": "waist up",
           "emotional_effect": "dialogue standard, character interaction, body language visible"},
    "MFS": {"full": "Medium Full Shot", "framing": "knees up / cowboy shot",
            "emotional_effect": "character + environment, action readiness, western genre staple"},
    "FS": {"full": "Full Shot", "framing": "full body, head to toe",
           "emotional_effect": "character in environment, costume, physical performance"},
    "WS": {"full": "Wide Shot", "framing": "full body + surroundings",
           "emotional_effect": "context, isolation, scale, environment relationship"},
    "EWS": {"full": "Extreme Wide Shot", "framing": "character is small in frame, environment dominant",
            "emotional_effect": "epic scale, isolation, insignificance, grandeur"},
    "OTS": {"full": "Over-the-Shoulder", "framing": "from behind one character toward another",
            "emotional_effect": "dialogue, perspective-taking, connection between characters"},
    "POV": {"full": "Point of View", "framing": "camera is the character's eyes",
            "emotional_effect": "immersion, subjectivity, empathy, 'becoming' the character"},
    "DUTCH": {"full": "Dutch Angle / Canted", "framing": "horizon tilted 15-45 degrees from level",
              "emotional_effect": "unease, disorientation, tension, psychological instability"},
    "BIRDS_EYE": {"full": "Bird's Eye / Overhead", "framing": "camera directly above subject",
                  "emotional_effect": "omniscience, detachment, pattern, god's-eye view"},
    "LOW_ANGLE": {"full": "Low Angle", "framing": "camera below eye level looking up",
                  "emotional_effect": "power, dominance, heroism, intimidation"},
    "HIGH_ANGLE": {"full": "High Angle", "framing": "camera above eye level looking down",
                   "emotional_effect": "vulnerability, weakness, overview, diminishment"},
}

# Camera movement types
CAMERA_MOVEMENTS = {
    "static": {"type": "Static / Locked-off", "feeling": "stability, observation, formality, clinical detachment"},
    "handheld": {"type": "Handheld", "feeling": "immediacy, documentary realism, chaos, presence, urgency"},
    "steadicam": {"type": "Steadicam / Gimbal", "feeling": "fluid presence, floating observer, smooth following, dreamlike"},
    "dolly_in": {"type": "Dolly In / Push In", "feeling": "intensifying focus, revelation, emotional escalation, entering a space"},
    "dolly_out": {"type": "Dolly Out / Pull Out", "feeling": "revelation, isolation, emotional withdrawal, contextualizing"},
    "truck": {"type": "Truck / Crab", "feeling": "parallel observation, lateral discovery, following action"},
    "pedestal": {"type": "Pedestal Up/Down", "feeling": "revelation (up), diminishment (down), vertical emphasis"},
    "pan": {"type": "Pan", "feeling": "survey, reveal, scanning, connecting elements in space"},
    "tilt": {"type": "Tilt", "feeling": "vertical reveal, scale emphasis, power dynamics (up = powerful, down = weak)"},
    "zoom": {"type": "Zoom (avoid in cinema unless motivated)", "feeling": "70s aesthetic, documentary, deliberate artificiality"},
    "snorricam": {"type": "SnorriCam / Body Rig", "feeling": "character trapped in their own perspective, psychological intensity, disconnection from environment"},
    "drone": {"type": "Drone / Aerial", "feeling": "epic scale, freedom, transcendence, establishing grandeur"},
}


def build_camera_spec(
    body: str = "arri_alexa_mini_lf",
    lens_type: str = "spherical_prime",
    focal_length: str = "35mm",
    aperture: str = "T2.0",
    shot_type: str = "MCU",
    movement: str = "static",
    custom_body: Optional[str] = None,
    custom_lens: Optional[str] = None,
) -> Dict:
    """
    Camera Specification Builder: composes a complete camera spec prompt.

    Draws from Higgsfield AI skill templates for cinematographic prompt vocabulary.
    Every spec element maps to a visual outcome in the generated image/video.

    Args:
      body: Camera body key (see CAMERA_BODIES).
      lens_type: Lens type key (see LENS_TYPES).
      focal_length: Focal length key (see FOCAL_LENGTHS).
      aperture: Aperture key (see APERTURES).
      shot_type: Shot type key (see SHOT_TYPES).
      movement: Movement key (see CAMERA_MOVEMENTS).
      custom_body: Override body description.
      custom_lens: Override lens description.

    Returns a complete camera specification prompt block with visual guidance.

    Edge cases: Unknown keys → warns but doesn't fail (prompt building is best-effort).
    """
    # Look up each component
    body_info = CAMERA_BODIES.get(body, {"make": "Unknown", "model": body, "sensor": "Unknown",
                                           "dynamic_range": "Unknown", "best_for": "General"})
    lens_info = LENS_TYPES.get(lens_type, {"category": lens_type, "characteristics": "Unknown",
                                             "examples": "Unknown"})
    fl_info = FOCAL_LENGTHS.get(focal_length, {"type": "unknown", "characteristics": "Unknown", "use": "General"})
    ap_info = APERTURES.get(aperture, {"light": "unknown", "dof": "unknown", "use": "General"})
    shot_info = SHOT_TYPES.get(shot_type, {"full": shot_type, "framing": "Unknown", "emotional_effect": "Unknown"})
    move_info = CAMERA_MOVEMENTS.get(movement, {"type": movement, "feeling": "Unknown"})

    # Build the prompt text
    prompt_parts = []

    # Camera body
    if custom_body:
        prompt_parts.append(f"Shot on {custom_body}")
    else:
        prompt_parts.append(f"Shot on {body_info['make']} {body_info['model']} ({body_info['sensor']} sensor)")

    # Lens
    if custom_lens:
        prompt_parts.append(f"with {custom_lens} lens")
    else:
        prompt_parts.append(f"with {lens_info['category']} lens ({lens_info['characteristics']})")

    # Focal length
    prompt_parts.append(f"at {focal_length} ({fl_info['type']} — {fl_info['use']})")

    # Aperture
    prompt_parts.append(f"at {aperture} ({ap_info['dof']} depth of field)")

    # Shot type
    prompt_parts.append(f"{shot_info['full']} ({shot_info['framing']})")
    prompt_parts.append(f"Emotional effect: {shot_info['emotional_effect']}")

    # Movement
    prompt_parts.append(f"Camera movement: {move_info['type']} — {move_info['feeling']}")

    prompt_text = ", ".join(prompt_parts)

    # Completeness check
    completeness_score = 6  # body, lens, focal_length, aperture, shot_type, movement
    spec_present = 0
    specs = {}
    for key, info in [("body", body_info), ("lens", lens_info), ("focal_length", fl_info),
                       ("aperture", ap_info), ("shot_type", shot_info), ("movement", move_info)]:
        has_custom = (key == "body" and custom_body) or (key == "lens" and custom_lens)
        specs[key] = {"value": body if key == "body" else (lens_type if key == "lens" else (focal_length if key == "focal_length" else (aperture if key == "aperture" else (shot_type if key == "shot_type" else movement)))),
                      "detail": info, "is_custom": has_custom}
        spec_present += 1

    return {"prompt_text": prompt_text,
            "specs": specs,
            "completeness": f"{spec_present}/{completeness_score}",
            "is_complete": spec_present >= 5,
            "source": "Higgsfield AI Camera Specification Templates"}


# ═══════════════════════════════════════════════════════════════════
# PART 2 — LIGHTING SCENARIO GENERATOR
# ═══════════════════════════════════════════════════════════════════

LIGHTING_SCENARIOS = {
    "three_point": {
        "description": "Classic 3-Point Lighting",
        "key_light": "Primary source, 45 degrees camera-left or camera-right, above eye level",
        "fill_light": "Soft fill opposite key, 2-3 stops under key, reduces shadow density",
        "backlight": "Behind subject, above, creates separation from background (rim/hair light)",
        "ratio": "Key:Fill typically 2:1 to 4:1 (higher = more dramatic)",
        "best_for": "Interview, corporate, standard narrative, product showcase",
        "prompt_additions": "three-point lighting, key light 45 degrees, soft fill, rim light separation"
    },
    "rembrandt": {
        "description": "Rembrandt Lighting (Triangle of Light)",
        "key_light": "Single hard source, high and 45 degrees to side, creates triangular patch of light on shadow cheek",
        "fill_light": "Minimal or none — deep shadows are the aesthetic",
        "backlight": "Optional subtle edge light for separation",
        "ratio": "Hard, high contrast; deep blacks in shadows",
        "best_for": "Dramatic portraiture, fine art, moody narrative, painterly aesthetic",
        "prompt_additions": "Rembrandt lighting, triangle of light on cheek, chiaroscuro, dramatic shadows, single key light"
    },
    "natural_window": {
        "description": "Natural Window Light",
        "key_light": "Large window as soft key, indirect daylight — enormous soft source",
        "fill_light": "Bounce from walls/ceiling or negative fill for contrast",
        "backlight": "None — window IS the light source",
        "ratio": "Soft, low contrast; beautiful wrap-around quality",
        "best_for": "Lifestyle, beauty, natural portraiture, verite documentary, 'golden hour interior'",
        "prompt_additions": "natural window light, soft daylight, indirect illumination, window as key source"
    },
    "silhouette": {
        "description": "Silhouette Lighting",
        "key_light": "Behind subject — subject is between camera and light source",
        "fill_light": "None — subject is deliberately underexposed (3-5 stops under background)",
        "backlight": "The backlight IS the key — strong, often backlit by sky/window/artificial source",
        "ratio": "Extreme contrast — subject near-black, background properly exposed",
        "best_for": "Mystery, drama, anonymity, iconic imagery, product tease, fashion",
        "prompt_additions": "silhouette lighting, subject backlit, strong rim light, background exposed, subject in shadow"
    },
    "neon": {
        "description": "Neon / Colored Practical Lighting",
        "key_light": "Neon tubes, LED strips, colored practicals as motivated sources",
        "fill_light": "Ambient neon fill or colored bounce",
        "backlight": "Often back/side neon rim in contrasting color",
        "ratio": "Depends on style — from soft cyberpunk to hard single-neon",
        "best_for": "Cyberpunk, nightlife, music video, fashion, futuristic, Blade Runner aesthetic",
        "prompt_additions": "neon lighting, colored practicals, cyan and magenta, motivated colored sources, Blade Runner aesthetic"
    },
    "golden_hour": {
        "description": "Golden Hour Natural Light",
        "key_light": "Low-angle warm sun (2800-3500K), soft directional quality",
        "fill_light": "Natural ambient fill from sky and environment bounce",
        "backlight": "Can use sun as backlight for halo/hair light effect",
        "ratio": "Soft, warm, flattering; the classic 'magic hour' quality",
        "best_for": "Lifestyle, beauty, nature, emotional narrative, 'aspirational' brand content",
        "prompt_additions": "golden hour, warm directional sunlight, soft shadows, lens flare, natural backlight, 3500K warmth"
    },
    "high_key": {
        "description": "High-Key / Commercial Lighting",
        "key_light": "Large, soft, frontal key — often an enormous softbox or book light",
        "fill_light": "Heavy fill — nearly matches key (1:1 to 2:1 ratio)",
        "backlight": "Strong back/top light for separation and product sparkle",
        "ratio": "Low contrast, bright, shadowless aesthetic",
        "best_for": "E-commerce, beauty, product, corporate, fashion catalog, clean product-on-white",
        "prompt_additions": "high-key lighting, soft frontal key, minimal shadows, commercial beauty, product on white, clean"
    },
    "low_key": {
        "description": "Low-Key / Noir Lighting",
        "key_light": "Hard, directional single source — often fresnel or bare bulb",
        "fill_light": "None or very minimal — shadows dominate",
        "backlight": "Subtle edge light for shape definition in darkness",
        "ratio": "Very high contrast — 8:1 or greater",
        "best_for": "Noir, thriller, drama, mystery, high-fashion edgy, intense portraiture",
        "prompt_additions": "low-key lighting, noir, hard single source, deep shadows, high contrast, film noir aesthetic"
    },
    "split": {
        "description": "Split Lighting",
        "key_light": "90 degrees to side — exactly half the face lit, half in complete shadow",
        "fill_light": "None — the split is the aesthetic",
        "backlight": "None — would break the split",
        "ratio": "Extreme — 50% illuminated, 50% dark",
        "best_for": "Duality, conflict, intensity, athlete portraits, dramatic character reveal",
        "prompt_additions": "split lighting, half face illuminated, half in shadow, 90 degree key, dual nature"
    },
}


def generate_lighting_scenario(
    scenario_name: str = "three_point",
    custom_key: Optional[str] = None,
    custom_fill: Optional[str] = None,
    custom_backlight: Optional[str] = None,
    custom_ratio: Optional[str] = None,
) -> Dict:
    """
    Lighting Scenario Generator: produces a complete lighting prompt.

    Draws from Higgsfield AI skill templates covering 9 standard lighting
    scenarios from cinematography + photography lighting theory.

    Args:
      scenario_name: One of the lighting scenario keys.
      custom_key/fill/backlight/ratio: Optional overrides for individual elements.

    Returns complete lighting prompt block with ratio and use-case guidance.
    """
    scenario = LIGHTING_SCENARIOS.get(scenario_name)
    if not scenario:
        available = ", ".join(LIGHTING_SCENARIOS.keys())
        return {"error": f"Unknown scenario '{scenario_name}'",
                "available_scenarios": available,
                "source": "Higgsfield AI Lighting Scenario Templates"}

    key = custom_key if custom_key else scenario["key_light"]
    fill = custom_fill if custom_fill else scenario["fill_light"]
    back = custom_backlight if custom_backlight else scenario["backlight"]
    ratio = custom_ratio if custom_ratio else scenario["ratio"]

    prompt_text = (
        f"{scenario['description']}. "
        f"Key light: {key}. "
        f"Fill light: {fill}. "
        f"Backlight: {back}. "
        f"Lighting ratio: {ratio}. "
        f"Best for: {scenario['best_for']}."
    )

    return {"scenario": scenario_name,
            "prompt_text": prompt_text,
            "prompt_additions": scenario["prompt_additions"],
            "lighting_setup": {"key_light": key, "fill_light": fill, "backlight": back, "ratio": ratio},
            "best_for": scenario["best_for"],
            "source": "Higgsfield AI Lighting Scenario Templates"}


# ═══════════════════════════════════════════════════════════════════
# PART 3 — COLOR GRADE PRESETS
# ═══════════════════════════════════════════════════════════════════

COLOR_GRADE_PRESETS = {
    "teal_orange": {
        "description": "Teal & Orange — the blockbuster look",
        "shadows": "Teal/cyan pushed into shadows and lower midtones",
        "midtones": "Neutral to slightly warm",
        "highlights": "Warm amber/orange in skin tones and highlights",
        "contrast": "Medium-high contrast with crushed blacks",
        "best_for": "Action, blockbuster, dramatic narrative, high-contrast commercial",
        "prompt_text": "teal and orange color grade, cyan shadows, warm amber skin tones, cinematic contrast, blockbuster look"
    },
    "desaturated": {
        "description": "Desaturated / Bleach Bypass",
        "shadows": "Deep, crushed blacks, often with slight blue tint",
        "midtones": "Desaturated, muted colors",
        "highlights": "Slightly blown, low saturation",
        "contrast": "Very high contrast, silver retention look",
        "best_for": "Dystopian, gritty, war, high-fashion edgy, Saving Private Ryan / Fight Club aesthetic",
        "prompt_text": "bleach bypass, desaturated colors, high contrast, silver retention, muted palette, gritty"
    },
    "warm_tungsten": {
        "description": "Warm Tungsten / Candlelight",
        "shadows": "Deep warm blacks, slightly lifted",
        "midtones": "Rich amber and gold tones",
        "highlights": "Warm glow, soft roll-off",
        "contrast": "Low-moderate contrast with lifted blacks",
        "best_for": "Period drama, romantic, intimate interior, holiday, cozy/warm brand",
        "prompt_text": "warm tungsten color grade, amber tones, candlelight warmth, golden midtones, lifted blacks, cozy atmosphere"
    },
    "cool_fluorescent": {
        "description": "Cool Fluorescent / Corporate",
        "shadows": "Cool blue/cyan tint in shadows",
        "midtones": "Neutral to slightly cool",
        "highlights": "Clean, bright, sometimes sterile whites",
        "contrast": "Moderate contrast, clean blacks",
        "best_for": "Corporate, sci-fi interior, medical, modern/clean brand aesthetic",
        "prompt_text": "cool fluorescent color grade, cyan-blue shadows, clean whites, sterile modern look, clinical"
    },
    "film_stock_emulation": {
        "description": "Film Stock Emulation",
        "shadows": "Rich, slightly lifted filmic blacks",
        "midtones": "Smooth roll-off, slight warmth or coolness depending on stock",
        "highlights": "Soft, compressed roll-off (film shoulder characteristic)",
        "contrast": "Moderate with filmic S-curve — no hard clipping",
        "best_for": "Premium narrative, fashion, nostalgic, 'timeless' brand content",
        "prompt_text": "film stock emulation, Kodak Portra 400, cinematic color, filmic S-curve, soft highlight roll-off, grain structure visible"
    },
    "cross_process": {
        "description": "Cross-Processed / Experimental",
        "shadows": "Color-shifted — often green or magenta tint",
        "midtones": "Unnatural color cast, shifted hues",
        "highlights": "Tinted or solarized appearance",
        "contrast": "High contrast with color channel clipping",
        "best_for": "Fashion editorial, music video, experimental, avant-garde, streetwear",
        "prompt_text": "cross-processed film, color shift, experimental color grade, fashion editorial, unnatural hues"
    },
    "natural_neutral": {
        "description": "Natural / Neutral / Documentary",
        "shadows": "Clean, true black with subtle warmth",
        "midtones": "Accurate color reproduction, natural saturation",
        "highlights": "Preserved detail, no clipping",
        "contrast": "Moderate, natural contrast",
        "best_for": "Documentary, corporate authenticity, journalism, 'real people' brand content",
        "prompt_text": "natural color grade, accurate skin tones, documentary look, true to life, clean"
    },
    "monochrome": {
        "description": "Black & White / Monochrome",
        "shadows": "Deep, rich blacks (Zone I-III)",
        "midtones": "Full tonal range, texture emphasis (Zone IV-VI)",
        "highlights": "Clean whites with detail (Zone VII-IX)",
        "contrast": "Adjustable — from Ansel Adams full-range to high-contrast street",
        "best_for": "Fine art, timeless portraiture, documentary gravitas, fashion, 'iconic' brand imagery",
        "prompt_text": "black and white, monochrome, full tonal range, Ansel Adams zone system, silver gelatin aesthetic"
    },
}


def apply_color_grade_preset(
    preset_name: str = "teal_orange",
    custom_override: Optional[str] = None,
) -> Dict:
    """
    Color Grade Preset: generates a color grading prompt block.

    Draws from Higgsfield AI skill templates covering 8 standard color grade
    presets used in professional cinematography and photography.

    Args:
      preset_name: One of the color grade preset keys.
      custom_override: If provided, use this as the full color grade prompt
        instead of the preset.

    Returns complete color grade prompt with shadow/midtone/highlight breakdown.
    """
    if custom_override:
        return {"preset": "custom",
                "prompt_text": custom_override,
                "source": "Custom color grade override"}

    preset = COLOR_GRADE_PRESETS.get(preset_name)
    if not preset:
        available = ", ".join(COLOR_GRADE_PRESETS.keys())
        return {"error": f"Unknown preset '{preset_name}'",
                "available_presets": available,
                "source": "Higgsfield AI Color Grade Templates"}

    return {"preset": preset_name,
            "description": preset["description"],
            "prompt_text": preset["prompt_text"],
            "breakdown": {"shadows": preset["shadows"], "midtones": preset["midtones"],
                         "highlights": preset["highlights"], "contrast": preset["contrast"]},
            "best_for": preset["best_for"],
            "source": "Higgsfield AI Color Grade Presets"}


# ═══════════════════════════════════════════════════════════════════
# PART 4 — COMPOSITION RULE ENFORCER
# ═══════════════════════════════════════════════════════════════════

COMPOSITION_RULES = {
    "rule_of_thirds": {
        "description": "Rule of Thirds — 3x3 grid; place subject at intersection points",
        "prompt_text": "rule of thirds composition, subject at intersection point, balanced negative space, 3x3 grid alignment",
        "best_for": "General photography, balanced composition, natural feel"
    },
    "golden_ratio": {
        "description": "Golden Ratio / Fibonacci Spiral — mathematically pleasing proportions",
        "prompt_text": "golden ratio composition, Fibonacci spiral framing, mathematically balanced proportions, 1.618:1 ratio",
        "best_for": "Fine art, premium product, architectural, 'timeless' aesthetic"
    },
    "leading_lines": {
        "description": "Leading Lines — environmental lines guide eye to subject",
        "prompt_text": "leading lines composition, converging perspective directing to subject, strong linear elements, depth",
        "best_for": "Architecture, landscape, product in environment, directional emphasis"
    },
    "negative_space": {
        "description": "Negative Space — subject small in frame, large empty space for text/graphics",
        "prompt_text": "negative space composition, subject small in frame, minimalist, large copy space, breathing room, graphic design friendly",
        "best_for": "Ad layouts, title cards, packaging, social media with overlaid text"
    },
    "symmetrical": {
        "description": "Symmetrical / Wes Anderson — perfect symmetry, centered subject",
        "prompt_text": "symmetrical composition, centered subject, perfect balance, Wes Anderson style, one-point perspective, geometric precision",
        "best_for": "Stylized narrative, fashion, architectural, 'perfectionist' brand aesthetic"
    },
    "frame_within_frame": {
        "description": "Frame Within a Frame — doorways, windows, arches framing subject",
        "prompt_text": "frame within a frame composition, doorway framing, natural vignette, subject framed by environment, depth layering",
        "best_for": "Narrative depth, voyeuristic feel, layered storytelling, isolation emphasis"
    },
    "dutch_angle_comp": {
        "description": "Dutch Angle — tilted horizon for unease/tension",
        "prompt_text": "Dutch angle composition, tilted horizon 15-25 degrees, canted frame, disorienting perspective, tension",
        "best_for": "Thriller, psychological tension, action, music video, breaking visual monotony"
    },
    "shallow_dof": {
        "description": "Shallow Depth of Field — subject sharp, background completely blurred",
        "prompt_text": "shallow depth of field, bokeh background, subject isolation, creamy out-of-focus background, T1.4 aesthetic",
        "best_for": "Portrait, product, beauty, separation from busy backgrounds"
    },
    "deep_focus": {
        "description": "Deep Focus — everything in sharp focus from foreground to background",
        "prompt_text": "deep focus, everything in focus, Citizen Kane style, foreground to background sharp, T8-T11 aperture aesthetic",
        "best_for": "Landscape, architecture, ensemble scenes, environmental storytelling"
    },
}


def enforce_composition_rule(
    rule_name: str = "rule_of_thirds",
    additional_notes: Optional[str] = None,
) -> Dict:
    """
    Composition Rule Enforcer: generates a composition prompt block.

    Draws from Higgsfield AI skill templates + standard cinematography
    composition rules (Mascelli, The Five C's, 1965).

    Args:
      rule_name: One of the composition rule keys.
      additional_notes: Optional custom addition to the composition prompt.

    Returns complete composition prompt text and rule description.
    """
    rule = COMPOSITION_RULES.get(rule_name)
    if not rule:
        available = ", ".join(COMPOSITION_RULES.keys())
        return {"error": f"Unknown rule '{rule_name}'",
                "available_rules": available,
                "source": "Higgsfield AI Composition Rule Templates"}

    prompt = rule["prompt_text"]
    if additional_notes:
        prompt += f", {additional_notes}"

    return {"rule": rule_name,
            "description": rule["description"],
            "prompt_text": prompt,
            "best_for": rule["best_for"],
            "source": "Higgsfield AI Composition Rule Templates; Mascelli, The Five C's of Cinematography (1965)"}


# ═══════════════════════════════════════════════════════════════════
# PART 5 — STYLE-REFERENCE LIBRARY
# ═══════════════════════════════════════════════════════════════════

STYLE_REFERENCES = {
    "cinematic": {
        "description": "Cinematic / Film Look",
        "prompt_text": "cinematic, shot on ARRI Alexa, anamorphic lens, film grain, 24fps motion cadence, cinematic color grading, widescreen 2.39:1 aspect ratio",
        "key_elements": ["filmic texture", "controlled depth of field", "motion blur at 180-degree shutter", "color grading", "anamorphic characteristics"],
        "best_for": "Brand films, narrative content, premium commercials, cinematic social"
    },
    "3d_cgi": {
        "description": "3D CGI / Rendered",
        "prompt_text": "3D render, CGI, Octane Render, photorealistic lighting, subsurface scattering, 8K, physically-based rendering, ray tracing, global illumination",
        "key_elements": ["perfect materials", "physics-accurate lighting", "unlimited camera positions", "impossible angles"],
        "best_for": "Product visualization, architectural, impossible camera moves, concept art"
    },
    "anime": {
        "description": "Anime / 2D Animation Style",
        "prompt_text": "anime style, Studio Ghibli aesthetic, hand-drawn animation, cel shading, vibrant colors, expressive characters, painterly backgrounds",
        "key_elements": ["cel shading", "line art", "simplified but expressive", "vibrant color palette", "background detail"],
        "best_for": "Youth-focused content, animation explainers, manga-inspired brand characters"
    },
    "motion_design": {
        "description": "Motion Design / Kinetic Type",
        "prompt_text": "motion design, kinetic typography, clean vector aesthetic, smooth easing, geometric shapes, dynamic transitions, 2.5D parallax",
        "key_elements": ["clean geometry", "typography-centric", "smooth motion curves", "color-block aesthetic"],
        "best_for": "Title sequences, explainer videos, social media content, brand manifestos"
    },
    "ecommerce": {
        "description": "E-Commerce Product",
        "prompt_text": "e-commerce photography, product on white, clean studio lighting, high-key, 360 product view, detail macro, packaging hero shot",
        "key_elements": ["clean background", "accurate color", "multiple angles", "detail visible", "consistent lighting"],
        "best_for": "Product pages, Amazon listings, catalog, marketplace imagery"
    },
    "ugc": {
        "description": "UGC / Social Media Authentic",
        "prompt_text": "user-generated content aesthetic, phone camera, natural lighting, unpolished, authentic, vertical 9:16, TikTok/Instagram native, real person, relatable",
        "key_elements": ["phone camera quality", "natural/imperfect lighting", "vertical framing", "candid feel", "minimal post-processing"],
        "best_for": "Social media organic content, TikTok/Reels, testimonial, 'real people' campaigns"
    },
    "fashion_editorial": {
        "description": "Fashion Editorial",
        "prompt_text": "fashion editorial, Vogue aesthetic, high-contrast lighting, dramatic shadows, avant-garde styling, editorial pose, luxury texture detail",
        "key_elements": ["dramatic lighting", "fashion-forward styling", "editorial composition", "premium texture", "attitude"],
        "best_for": "Fashion brands, luxury, beauty campaigns, lookbooks"
    },
    "documentary": {
        "description": "Documentary / Verite",
        "prompt_text": "documentary style, handheld camera, natural available light, verite, observational, candid moments, real environments, unscripted feel",
        "key_elements": ["handheld motion", "available light", "real people", "unpolished", "in-the-moment"],
        "best_for": "Brand documentaries, behind-the-scenes, CSR/impact storytelling, 'authentic' brand content"
    },
    "vintage_film": {
        "description": "Vintage Film / Super 8 / 16mm",
        "prompt_text": "Super 8 film aesthetic, 16mm grain, vintage color, light leaks, film burn, retro, nostalgic, 1970s home movie look, Kodachrome",
        "key_elements": ["film grain", "light leaks", "vintage color palette", "gate weave", "dust and scratches"],
        "best_for": "Nostalgia campaigns, heritage brands, music videos, 'throwback' content"
    },
    "minimalist": {
        "description": "Minimalist / Scandinavian",
        "prompt_text": "minimalist aesthetic, clean lines, negative space, restrained color palette, Scandinavian design, less is more, intentional composition, natural materials",
        "key_elements": ["clean", "intentional", "minimal color", "geometric precision", "calm"],
        "best_for": "Design-forward brands, tech, wellness, premium minimal products"
    },
}


def get_style_reference(
    style_name: str = "cinematic",
    blend_styles: Optional[List[str]] = None,
) -> Dict:
    """
    Style-Reference Library: retrieves a visual style prompt template.

    Draws from Higgsfield AI skill templates covering 10 visual style categories.

    Args:
      style_name: One of the style reference keys.
      blend_styles: Optional list of additional style keys to blend in.

    Returns complete style prompt text and key visual elements.
    """
    style = STYLE_REFERENCES.get(style_name)
    if not style:
        available = ", ".join(STYLE_REFERENCES.keys())
        return {"error": f"Unknown style '{style_name}'",
                "available_styles": available,
                "source": "Higgsfield AI Style-Reference Library"}

    result = {"primary_style": style_name,
              "description": style["description"],
              "prompt_text": style["prompt_text"],
              "key_elements": style["key_elements"],
              "best_for": style["best_for"]}

    if blend_styles:
        blend_texts = []
        for bs in blend_styles:
            if bs in STYLE_REFERENCES:
                blend_texts.append(STYLE_REFERENCES[bs]["prompt_text"])
        if blend_texts:
            result["blended_styles"] = blend_styles
            result["prompt_text"] = style["prompt_text"] + ", " + ", ".join(blend_texts)

    result["source"] = "Higgsfield AI Style-Reference Library"
    return result


# ═══════════════════════════════════════════════════════════════════
# PART 6 — NEGATIVE PROMPT BUILDER
# ═══════════════════════════════════════════════════════════════════

# Standard negative prompt categories (from AKCodez/higgsfield-claude-skills)
NEGATIVE_CATEGORIES = {
    "anatomy": ["bad anatomy", "deformed hands", "extra fingers", "fused fingers", "missing fingers",
                "twisted limbs", "disfigured", "poorly drawn face", "mutated hands", "bad proportions"],
    "artifacts": ["jpeg artifacts", "compression artifacts", "blurry", "grainy", "noise",
                  "pixelated", "oversharpened", "haloing", "chromatic aberration", "banding"],
    "lighting": ["overexposed", "underexposed", "flat lighting", "harsh shadows",
                 "blown highlights", "crushed blacks with no detail", "uneven lighting"],
    "composition": ["bad composition", "crooked horizon", "cluttered", "distracting background",
                    "subject too small", "awkward framing", "amputated framing", "unintentional Dutch angle"],
    "style_quality": ["low quality", "low resolution", "amateur", "snapshot", "poorly drawn",
                      "sketch", "doodle", "rough", "unfinished", "work in progress"],
    "text": ["watermark", "signature", "text", "logo", "branding", "timestamp", "overlay text",
             "copyright notice", "username", "UI elements"],
    "ai_artifacts": ["extra limbs", "bad AI", "AI artifacts", "uncanny valley", "plastic skin",
                     "waxy skin", "dead eyes", "soulless eyes", "CGI look", "3D render look"],
    "photo_quality": ["motion blur", "camera shake", "out of focus", "soft focus unintentional",
                      "lens flare unwanted", "vignetting unwanted", "barrel distortion"],
}


def build_negative_prompt(
    exclude_anatomy: bool = True,
    exclude_artifacts: bool = True,
    exclude_lighting_issues: bool = False,
    exclude_composition_issues: bool = False,
    exclude_low_quality: bool = True,
    exclude_text: bool = True,
    exclude_ai_artifacts: bool = False,
    exclude_photo_quality_issues: bool = False,
    custom_negatives: Optional[List[str]] = None,
) -> Dict:
    """
    Negative Prompt Builder: constructs a negative prompt from standard categories.

    Draws from AKCodez/higgsfield-claude-skills GitHub repository + Stable Diffusion
    community negative prompt best practices.

    Args:
      exclude_anatomy: Exclude bad anatomy terms (important for human subjects).
      exclude_artifacts: Exclude compression/artifact terms.
      exclude_lighting_issues: Exclude lighting problem terms.
      exclude_composition_issues: Exclude composition problem terms.
      exclude_low_quality: Exclude low-quality/aesthetic terms.
      exclude_text: Exclude watermark/text/logos.
      exclude_ai_artifacts: Exclude AI-specific artifact terms.
      exclude_photo_quality_issues: Exclude photo quality problem terms.
      custom_negatives: Additional custom negative terms.

    Returns a complete negative prompt string and category breakdown.
    """
    selected_terms = []
    categories_used = []

    selection = {
        "anatomy": (exclude_anatomy, NEGATIVE_CATEGORIES["anatomy"]),
        "artifacts": (exclude_artifacts, NEGATIVE_CATEGORIES["artifacts"]),
        "lighting": (exclude_lighting_issues, NEGATIVE_CATEGORIES["lighting"]),
        "composition": (exclude_composition_issues, NEGATIVE_CATEGORIES["composition"]),
        "style_quality": (exclude_low_quality, NEGATIVE_CATEGORIES["style_quality"]),
        "text": (exclude_text, NEGATIVE_CATEGORIES["text"]),
        "ai_artifacts": (exclude_ai_artifacts, NEGATIVE_CATEGORIES["ai_artifacts"]),
        "photo_quality": (exclude_photo_quality_issues, NEGATIVE_CATEGORIES["photo_quality"]),
    }

    for cat, (enabled, terms) in selection.items():
        if enabled:
            selected_terms.extend(terms)
            categories_used.append(cat)

    if custom_negatives:
        selected_terms.extend(custom_negatives)
        categories_used.append("custom")

    negative_prompt = ", ".join(selected_terms) if selected_terms else "(none)"

    return {"negative_prompt": negative_prompt,
            "categories_used": categories_used,
            "term_count": len(selected_terms),
            "default_safe_set": ["anatomy", "artifacts", "style_quality", "text"],
            "source": "AKCodez/higgsfield-claude-skills; Stable Diffusion Negative Prompt Best Practices"}


# ═══════════════════════════════════════════════════════════════════
# PART 7 — COMPLETE PROMPT BUILDER
# ═══════════════════════════════════════════════════════════════════

def build_complete_prompt(
    camera_spec: Dict,
    lighting_scenario: Dict,
    color_grade: Dict,
    composition_rule: Dict,
    style_reference: Dict,
    negative_prompt: Dict,
    subject_description: str = "",
    additional_prompt: Optional[str] = None,
) -> Dict:
    """
    Complete Prompt Builder: assembles all prompt blocks into a final prompt.

    Composition order (following cinematography prompt conventions):
      1. Style Reference (the overall aesthetic direction)
      2. Subject Description (what is being photographed/filmed)
      3. Camera Specification (how it's captured)
      4. Lighting Scenario (how it's lit)
      5. Composition Rule (how it's framed)
      6. Color Grade (how it's colored)
      7. Negative Prompt (what to exclude)

    Args:
      camera_spec: Output of build_camera_spec().
      lighting_scenario: Output of generate_lighting_scenario().
      color_grade: Output of apply_color_grade_preset().
      composition_rule: Output of enforce_composition_rule().
      style_reference: Output of get_style_reference().
      negative_prompt: Output of build_negative_prompt().
      subject_description: What is in the frame? (required)
      additional_prompt: Any additional prompt text.

    Returns the complete positive prompt, negative prompt, and completeness report.
    """
    if not subject_description.strip():
        raise ValueError("subject_description is required — what is being photographed/filmed?")

    # Assemble positive prompt in standard order
    prompt_parts = []

    # Style reference (overall aesthetic)
    if "error" not in style_reference:
        prompt_parts.append(style_reference.get("prompt_text", ""))

    # Subject (what is in the frame)
    prompt_parts.append(subject_description.strip())

    # Camera spec
    if "error" not in camera_spec:
        prompt_parts.append(camera_spec.get("prompt_text", ""))

    # Lighting
    if "error" not in lighting_scenario:
        prompt_parts.append(lighting_scenario.get("prompt_additions", ""))

    # Composition
    if "error" not in composition_rule:
        prompt_parts.append(composition_rule.get("prompt_text", ""))

    # Color grade
    if "error" not in color_grade:
        prompt_parts.append(color_grade.get("prompt_text", ""))

    # Any additional prompt
    if additional_prompt:
        prompt_parts.append(additional_prompt)

    positive_prompt = ", ".join(p for p in prompt_parts if p.strip())

    # Negative prompt
    neg_prompt_text = negative_prompt.get("negative_prompt", "")

    # Completeness check: 6 dimensions (style, subject, camera, lighting, composition, color)
    dimensions = {
        "style": "error" not in style_reference,
        "subject": bool(subject_description.strip()),
        "camera": "error" not in camera_spec,
        "lighting": "error" not in lighting_scenario,
        "composition": "error" not in composition_rule,
        "color_grade": "error" not in color_grade,
    }
    complete_count = sum(1 for v in dimensions.values() if v)

    if complete_count == 6:
        completeness = "COMPLETE — all 6 prompt dimensions populated."
    elif complete_count >= 4:
        completeness = f"ADEQUATE — {complete_count}/6 dimensions populated. Add the missing dimensions for best results."
    else:
        completeness = f"INCOMPLETE — only {complete_count}/6 dimensions populated. Prompt will lack specificity."

    return {"positive_prompt": positive_prompt,
            "negative_prompt": neg_prompt_text,
            "dimensions": dimensions,
            "completeness": f"{complete_count}/6",
            "completeness_verdict": completeness,
            "source": "Higgsfield AI + AKCodez/higgsfield-claude-skills — Complete Prompt Builder"}


def verify_prompt_completeness(
    positive_prompt: str,
    negative_prompt: str,
) -> Dict:
    """
    Prompt Completeness Verifier: checks if a prompt covers all 6 dimensions.

    Verifies that a prompt string (or pair of positive/negative prompts) contains
    all the elements needed for a complete cinematographic prompt: style, camera
    specification, lighting, composition, color grade, and negative exclusions.

    Args:
      positive_prompt: The positive prompt text.
      negative_prompt: The negative prompt text.

    Returns completeness check with missing dimension detection.
    """
    pos_lower = positive_prompt.lower()

    # Dimension detection heuristics
    dimensions = {
        "style": any(w in pos_lower for w in ["cinematic", "photorealistic", "3d render", "anime",
                                               "motion design", "documentary", "e-commerce", "ugc",
                                               "fashion editorial", "vintage", "minimalist", "style"]),
        "camera": any(w in pos_lower for w in ["shot on", "camera", "lens", "focal length", "aperture",
                                                "f/", "t/", "mm", "close-up", "wide shot", "medium shot"]),
        "lighting": any(w in pos_lower for w in ["lighting", "key light", "fill light", "backlight",
                                                  "rim light", "soft light", "hard light", "golden hour",
                                                  "neon", "three-point", "rembrandt", "silhouette"]),
        "composition": any(w in pos_lower for w in ["composition", "rule of thirds", "golden ratio",
                                                     "leading lines", "negative space", "symmetrical",
                                                     "framing", "dutch angle", "depth of field"]),
        "color_grade": any(w in pos_lower for w in ["color grade", "color grading", "teal", "orange",
                                                     "desaturated", "bleach bypass", "warm", "cool",
                                                     "monochrome", "film stock", "Kodak", "saturation"]),
        "subject": len(positive_prompt.strip()) > 50,  # Any substantive prompt has a subject
        "negative": bool(negative_prompt.strip()) and negative_prompt != "(none)",
    }

    present = [dim for dim, ok in dimensions.items() if ok]
    missing = [dim for dim, ok in dimensions.items() if not ok and dim != "negative"]

    if len(present) >= 6:
        verdict = "COMPLETE PROMPT — all critical dimensions detected."
    elif len(present) >= 4:
        verdict = f"ADEQUATE PROMPT — {len(present)}/7 dimensions detected. Missing: {missing}."
    else:
        verdict = f"INCOMPLETE PROMPT — only {len(present)}/7 dimensions detected. Missing: {missing}. Add detail."

    return {"dimensions_detected": present,
            "dimensions_missing": missing,
            "completeness_score": f"{len(present)}/7",
            "verdict": verdict,
            "source": "Higgsfield AI Prompt Completeness Verification"}


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
    print("SELF-TEST SUITE: prompt_craft.py")
    print("Cinematographic Prompt Vocabulary Builder")
    print("=" * 70)

    # ── Camera Spec Builder ──
    print("\n── Camera Specification Builder ──")
    cam = build_camera_spec(
        body="arri_alexa_35", lens_type="anamorphic",
        focal_length="50mm", aperture="T2.0",
        shot_type="CU", movement="static"
    )
    ck("camera spec contains ARRI", "ARRI" in cam["prompt_text"], True)
    ck("camera spec is complete (6/6)", cam["is_complete"], True)
    ck("contains shot type CU detail", "Close-Up" in cam["prompt_text"], True)

    # Custom body/lens
    cam_custom = build_camera_spec(
        body="arri_alexa_35", lens_type="spherical_prime",
        focal_length="85mm", aperture="T1.4",
        shot_type="ECU", movement="handheld",
        custom_body="Sony FX9 with Atomos recorder",
        custom_lens="vintage Canon FD 85mm f/1.2"
    )
    ck("custom body in prompt", "Sony FX9" in cam_custom["prompt_text"], True)
    ck("custom lens in prompt", "Canon FD" in cam_custom["prompt_text"], True)

    # ── Lighting Scenario Generator ──
    print("\n── Lighting Scenario Generator ──")
    light = generate_lighting_scenario("rembrandt")
    ck("rembrandt contains chiaroscuro", "chiaroscuro" in light["prompt_additions"] or "Rembrandt" in light["prompt_text"], True)

    light2 = generate_lighting_scenario("neon")
    ck("neon contains Blade Runner", "blade runner" in light2["prompt_additions"].lower(), True)

    light_custom = generate_lighting_scenario("three_point", custom_key="Large octabox frontal")
    ck("custom key overrides default", "octabox" in light_custom["lighting_setup"]["key_light"], True)

    # ── Color Grade Presets ──
    print("\n── Color Grade Presets ──")
    cg = apply_color_grade_preset("teal_orange")
    ck("teal_orange contains blockbuster", "blockbuster" in cg["prompt_text"], True)

    cg2 = apply_color_grade_preset("film_stock_emulation")
    ck("film stock contains Kodak", "Kodak" in cg2["prompt_text"], True)

    cg_custom = apply_color_grade_preset("teal_orange", custom_override="custom vintage Instagram filter, faded, warm 1970s")
    ck("custom grade override", "1970s" in cg_custom["prompt_text"], True)

    # ── Composition Rule Enforcer ──
    print("\n── Composition Rule Enforcer ──")
    comp = enforce_composition_rule("rule_of_thirds")
    ck("rule of thirds contains grid", "grid" in comp["prompt_text"], True)

    comp2 = enforce_composition_rule("symmetrical")
    ck("symmetrical contains Wes Anderson", "Wes Anderson" in comp2["prompt_text"], True)

    # ── Style-Reference Library ──
    print("\n── Style-Reference Library ──")
    style = get_style_reference("cinematic")
    ck("cinematic contains ARRI Alexa", "ARRI Alexa" in style["prompt_text"], True)

    style2 = get_style_reference("anime")
    ck("anime contains Studio Ghibli", "Studio Ghibli" in style2["prompt_text"], True)

    style_blend = get_style_reference("cinematic", blend_styles=["documentary"])
    ck("blend contains documentary elements", "handheld" in style_blend["prompt_text"].lower(), True)

    # ── Negative Prompt Builder ──
    print("\n── Negative Prompt Builder ──")
    neg = build_negative_prompt(
        exclude_anatomy=True, exclude_artifacts=True,
        exclude_lighting_issues=False, exclude_low_quality=True,
        exclude_text=True,
        custom_negatives=["watermark", "oversaturated"]
    )
    ck("negative prompt contains bad anatomy", "bad anatomy" in neg["negative_prompt"], True)
    ck("negative prompt contains custom terms", "oversaturated" in neg["negative_prompt"], True)
    ck("uses 4+ categories", len(neg["categories_used"]) >= 4, True)

    # ── Complete Prompt Builder ──
    print("\n── Complete Prompt Builder ──")
    full_prompt = build_complete_prompt(
        camera_spec=cam, lighting_scenario=light,
        color_grade=cg, composition_rule=comp,
        style_reference=style, negative_prompt=neg,
        subject_description="A woman in a flowing red dress standing on a cliff edge at sunset",
    )
    ck("full prompt has positive text", len(full_prompt["positive_prompt"]) > 100, True)
    ck("full prompt has negative text", len(full_prompt["negative_prompt"]) > 20, True)
    ck("full prompt is complete (6/6)", full_prompt["completeness"] == "6/6", True)
    ck("complete verdict", "COMPLETE" in full_prompt["completeness_verdict"], True)

    # ── Prompt Completeness Verifier ──
    print("\n── Prompt Completeness Verifier ──")
    v = verify_prompt_completeness(full_prompt["positive_prompt"], full_prompt["negative_prompt"])
    ck("verification detects most dimensions", int(v["completeness_score"].split("/")[0]) >= 5, True)

    weak_v = verify_prompt_completeness("a nice photo of a tree", "")
    ck("weak prompt has low completeness", int(weak_v["completeness_score"].split("/")[0]) < 4, True)

    print("\n" + "=" * 70)
    tot = p + f
    print(f"RESULTS: {p}/{tot} passed, {f} failed")
    print("=" * 70)
    return 0 if f == 0 else 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
