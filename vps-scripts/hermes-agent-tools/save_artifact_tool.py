#!/usr/bin/env python3
"""
save_artifact Tool — evidence-rail persistence for YVON (2026-09-04).

Writes a file into the turn's evidence folder under the wrapper's artifacts
store (YVON_ARTIFACTS_ROOT, set by vps-scripts/yvon-hermes-http/main.py —
normally /opt/yvon-hermes-http/workspaces/_artifacts). From there:

  - the wrapper scans the turn dir on every tool-end and just before `done`,
    emitting live `artifact` SSE frames + events rows for the dashboard's
    ArtifactStrip / TaskProposalPrompt evidence chips
  - the wrapper's StaticFiles mount serves it publicly at
    https://hermes.yvon.in/artifacts/<venture>/<correlation>/<filename>

Deliberate constraints (loud beats silent, per the evidence rail):
  - writes ONLY under YVON_ARTIFACTS_ROOT, realpath-checked so a symlinked
    `dir` cannot smuggle a write outside the store
  - `dir` must be the turn's artifacts dir named in the [ARTIFACTS] prompt
    block and must already exist (the wrapper pre-creates it before the agent
    runs) — no implicit per-turn context, no cross-turn races
  - exactly one of `content` (text) or `copy_from` (absolute path to a file
    another tool already produced, e.g. a screenshot)

Owner: dev · evidence rail fix ②, 2026-09-04
"""

import os
import shutil

from tools.registry import registry, tool_error


def _safe_filename(name: str):
    """Reject anything that could escape the turn dir or hide as a dotfile.
    Returns the clean name, or None with a reason."""
    if not name or name != name.strip():
        return None
    if name in (".", "..") or "/" in name or "\\" in name:
        return None
    if name.startswith("."):
        return None
    if len(name) > 180:
        return None
    return name


def _unique_dest(directory: str, filename: str) -> str:
    """Never overwrite: shot.png → shot-2.png → shot-3.png …"""
    stem, ext = os.path.splitext(filename)
    candidate = os.path.join(directory, filename)
    n = 2
    while os.path.lexists(candidate):
        candidate = os.path.join(directory, f"{stem}-{n}{ext}")
        n += 1
    return candidate


def _handle_save_artifact(args, **kw):  # noqa: ARG001 — kw carries agent ctx we don't need
    filename = _safe_filename(str(args.get("filename") or ""))
    if not filename:
        return tool_error("save_artifact needs a clean 'filename' (no path separators, no leading dot)")

    root = os.path.realpath(os.environ.get("YVON_ARTIFACTS_ROOT", ""))
    if not root or not os.path.isdir(root):
        return tool_error(
            "artifact store not configured (YVON_ARTIFACTS_ROOT missing) — "
            "evidence cannot be saved; say so instead of pretending"
        )

    dir_arg = str(args.get("dir") or "").strip()
    if not dir_arg:
        return tool_error(
            "save_artifact needs 'dir' — the turn's artifacts dir exactly as "
            "named in the [ARTIFACTS] block of your instructions"
        )
    real_dir = os.path.realpath(dir_arg)
    if real_dir != root and not real_dir.startswith(root + os.sep):
        return tool_error("refusing: 'dir' is outside the artifacts store")
    if not os.path.isdir(real_dir):
        return tool_error(
            f"artifacts dir does not exist: {dir_arg} — use the turn's "
            "[ARTIFACTS] dir verbatim, it is pre-created for you"
        )

    content = args.get("content")
    copy_from = str(args.get("copy_from") or "").strip()
    if (content is None) == (not copy_from):
        return tool_error("pass exactly one of 'content' (text) or 'copy_from' (path to an existing file)")

    # Overwrite mode (2026-09-05): the reference-study contract fixes role
    # names (reference.md, reference.png) and forbids -2/-3 suffixed copies,
    # so a redone capture must REPLACE the file. Opt-in — every other caller
    # keeps the never-overwrite guarantee.
    overwrite = bool(args.get("overwrite"))
    dest = os.path.join(real_dir, filename) if overwrite else _unique_dest(real_dir, filename)
    replaced = overwrite and os.path.lexists(dest)
    try:
        if copy_from:
            src = os.path.realpath(copy_from)
            if not os.path.isfile(src):
                return tool_error(f"copy_from is not an existing file: {copy_from}")
            shutil.copyfile(src, dest)
            size = os.path.getsize(dest)
        else:
            text = content if isinstance(content, str) else str(content)
            with open(dest, "w", encoding="utf-8") as fh:
                fh.write(text)
            size = len(text.encode("utf-8"))
    except OSError as exc:
        return tool_error(f"save failed: {exc}")

    rel = os.path.relpath(dest, root)
    verb = "replaced" if replaced else "saved"
    return (
        f"{verb} {size} bytes → artifacts/{rel}. It will be published and shown "
        "as evidence when the turn ends."
    )


SAVE_ARTIFACT_SCHEMA = {
    "name": "save_artifact",
    "description": (
        "Save evidence (a screenshot, scraped data, notes) into this turn's "
        "artifacts folder so it is published and shown to the user as evidence. "
        "'dir' is the turn's artifacts dir exactly as named in the [ARTIFACTS] "
        "block. Pass 'content' (text) OR 'copy_from' (absolute path to a file "
        "another tool already saved, e.g. a screenshot) — never both."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "filename": {
                "type": "string",
                "description": "File name only, e.g. reference-home.png or scraped-data.json",
            },
            "dir": {
                "type": "string",
                "description": "The turn's artifacts dir, verbatim from the [ARTIFACTS] block",
            },
            "content": {
                "type": "string",
                "description": "Text content to write (e.g. scraped data as JSON). Omit when using copy_from.",
            },
            "copy_from": {
                "type": "string",
                "description": "Absolute path of an existing file to copy in (e.g. a screenshot). Omit when using content.",
            },
            "overwrite": {
                "type": "boolean",
                "description": (
                    "Replace an existing file of the same name instead of "
                    "auto-renaming to -2/-3. Use when REDOING a capture with "
                    "a fixed role name (reference.md, reference.png) so the "
                    "evidence strip never shows duplicate suffixed copies."
                ),
            },
        },
        "required": ["filename", "dir"],
    },
}

registry.register(
    name="save_artifact",
    toolset="file",
    schema=SAVE_ARTIFACT_SCHEMA,
    handler=_handle_save_artifact,
    emoji="🧾",
    description="Save a file into the turn's evidence artifacts folder",
)
