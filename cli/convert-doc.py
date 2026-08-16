#!/usr/bin/env python3
"""
cli/convert-doc.py — batch document-to-Markdown converter, wraps anydoc
(github.com/firecrawl/anydoc, MIT, installed via `pip install firecrawl-anydoc`
— see requirements.txt). Added 2026-08-15 so source books dropped into
Teams/Books/ (currently an empty reference location per its README — "Actual
PDF files must be sourced by the operator and placed here") can actually be
read/cited/chunked instead of sitting as opaque binaries.

Supports: .doc .docx .docm .ppt .pps .pot .pptx .pptm .ppsx .ppsm
          .xls .xlsx .xlsm .xlsb .odt .ods .odp .rtf .epub .csv .pdf
(text-based PDFs only — scanned/image-only PDFs need OCR, which anydoc
doesn't do; those fail loudly with a clear message rather than silently
producing nothing, consistent with this repo's "no invented data" rule.)

Usage:
    python3 cli/convert-doc.py Teams/Books/some-book.pdf
    python3 cli/convert-doc.py Teams/Books/                # batch, whole dir
    python3 cli/convert-doc.py Teams/Books/ --out-dir Teams/Books/markdown
    python3 cli/convert-doc.py Teams/Books/ --force        # reconvert existing

Output defaults to a sibling `markdown/` folder next to the input, so raw
sources and converted text don't mix in the same listing.
"""

import argparse
import sys
from pathlib import Path

try:
    import anydoc
except ImportError:
    print("anydoc not installed. Run: pip install firecrawl-anydoc --break-system-packages", file=sys.stderr)
    sys.exit(1)

SUPPORTED = {
    ".doc", ".docx", ".docm", ".ppt", ".pps", ".pot", ".pptx", ".pptm", ".ppsx", ".ppsm",
    ".xls", ".xlsx", ".xlsm", ".xlsb", ".odt", ".ods", ".odp", ".rtf", ".epub", ".csv", ".pdf",
}


def convert_one(src: Path, out_dir: Path, force: bool) -> tuple[bool, str]:
    if src.suffix.lower() not in SUPPORTED:
        return False, f"skip (unsupported extension {src.suffix})"

    out_path = out_dir / (src.stem + ".md")
    if out_path.exists() and not force:
        return False, "skip (already converted, use --force to redo)"

    try:
        markdown = anydoc.to_markdown(str(src))
    except anydoc.EncryptedError:
        return False, "FAILED (encrypted/password-protected)"
    except anydoc.UnsupportedError:
        return False, "FAILED (unsupported — likely a scanned/image-only PDF; needs OCR, anydoc can't do this)"
    except anydoc.MalformedError:
        return False, "FAILED (structurally unusable, no meaningful content extracted)"
    except anydoc.ConvertError as e:
        return False, f"FAILED ({e})"

    out_dir.mkdir(parents=True, exist_ok=True)
    out_path.write_text(markdown, encoding="utf-8")
    return True, f"-> {out_path}"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("path", help="File or directory to convert")
    ap.add_argument("--out-dir", help="Output directory (default: <input-dir>/markdown/)")
    ap.add_argument("--force", action="store_true", help="Reconvert even if output already exists")
    args = ap.parse_args()

    src_path = Path(args.path)
    if not src_path.exists():
        print(f"No such path: {src_path}", file=sys.stderr)
        sys.exit(1)

    if src_path.is_file():
        out_dir = Path(args.out_dir) if args.out_dir else src_path.parent / "markdown"
        ok, msg = convert_one(src_path, out_dir, args.force)
        print(f"{'OK  ' if ok else 'SKIP' if 'skip' in msg else 'FAIL'} {src_path.name}: {msg}")
        sys.exit(0 if ok or "skip" in msg else 1)

    out_dir = Path(args.out_dir) if args.out_dir else src_path / "markdown"
    files = sorted(p for p in src_path.iterdir() if p.is_file() and p.suffix.lower() in SUPPORTED)
    if not files:
        print(f"No supported files in {src_path} ({', '.join(sorted(SUPPORTED))})")
        return

    converted = failed = skipped = 0
    for f in files:
        ok, msg = convert_one(f, out_dir, args.force)
        tag = "OK  " if ok else ("SKIP" if "skip" in msg else "FAIL")
        print(f"{tag} {f.name}: {msg}")
        converted += ok
        failed += tag == "FAIL"
        skipped += tag == "SKIP"

    print(f"\n{converted} converted, {skipped} skipped, {failed} failed, out of {len(files)} files.")
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
