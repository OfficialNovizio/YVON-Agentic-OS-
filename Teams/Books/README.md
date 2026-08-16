# Books

Reference library for agent grounding. Books used by agents for domain expertise.

Books are referenced via Route D wisdom documents in `Shared OS/logical/`. Agents cite specific chapters and page numbers from these works.

**Note:** This directory is a reference location. Actual PDF files must be sourced by the operator and placed here.

**Converting a dropped book to Markdown** (so it's actually readable/citable/chunkable, 2026-08-15): `python3 cli/convert-doc.py Teams/Books/<file>` — or `python3 cli/convert-doc.py Teams/Books/` to batch-convert everything in the folder. Output goes to `Teams/Books/markdown/`. Wraps [anydoc](https://github.com/firecrawl/anydoc) (MIT, `pip install firecrawl-anydoc`), which handles PDF/EPUB/DOCX/PPTX/XLSX/ODT/RTF/CSV. Scanned/image-only PDFs need OCR, which this doesn't do — those fail loudly rather than producing empty output.
