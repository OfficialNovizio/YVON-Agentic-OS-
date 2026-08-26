/**
 * lib/job-hunt/resume-text.ts — extracts plain text from an uploaded resume
 * file (PDF or DOCX) server-side.
 *
 * YVON-OS's original analyze-resume route sent the PDF straight to Claude's
 * native document-vision content block (Anthropic-only). This dashboard's
 * active AI provider is swappable (Settings > AI Provider), so instead we
 * extract text here and hand plain text to lib/ai-client's callSynthesis —
 * works no matter which provider is active, consistent with how every other
 * Job Hunt AI feature (LinkedIn drafts, network messages) already calls it.
 *
 * PDF library history (2026-08-15): started with `pdf-parse` v2, which
 * wraps pdfjs-dist's "legacy" build. That build requires DOMMatrix/
 * ImageData/Path2D, normally polyfilled via the native `@napi-rs/canvas`
 * package — when that native binding fails to load (as it did on the
 * operator's Mac: "Cannot load @napi-rs/canvas ... DOMMatrix is not
 * defined"), extraction crashes outright, even for pure text extraction
 * with no rendering involved. Tried downgrading to the classic pure-JS
 * `pdf-parse@1.1.1` (no canvas dependency at all) but its vendored
 * pdf.js v1.10.100 choked on a modern reportlab-generated test PDF
 * ("bad XRef entry") — too old to trust against real-world resume
 * exporters (Word, Google Docs, Canva, LaTeX all produce different xref
 * structures). Landed on `unpdf`: ships its own serverless-optimized
 * pdf.js build with no native/canvas dependency for text extraction.
 * Verified locally against three differently-generated PDFs (hand-built,
 * reportlab, pandoc/wkhtmltopdf) before landing this.
 */

import { extractText, getDocumentProxy } from 'unpdf'
import mammoth from 'mammoth'

export async function extractResumeText(buffer: Buffer, fileType: string): Promise<string> {
  if (fileType === 'application/pdf') {
    const pdf = await getDocumentProxy(new Uint8Array(buffer))
    const { text } = await extractText(pdf, { mergePages: true })
    return text.trim()
  }

  if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer })
    return result.value.trim()
  }

  throw new Error(`Unsupported resume file type: ${fileType}`)
}
