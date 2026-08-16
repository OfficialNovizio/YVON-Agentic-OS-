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
 */

import { PDFParse } from 'pdf-parse'
import mammoth from 'mammoth'

export async function extractResumeText(buffer: Buffer, fileType: string): Promise<string> {
  if (fileType === 'application/pdf') {
    const parser = new PDFParse({ data: buffer })
    try {
      const result = await parser.getText()
      // pdf-parse inserts "-- N of M --" page-break markers into result.text;
      // strip them so they don't pollute the text handed to the AI prompt.
      return result.text
        .replace(/^--\s*\d+\s*of\s*\d+\s*--$/gm, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    } finally {
      await parser.destroy()
    }
  }

  if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer })
    return result.value.trim()
  }

  throw new Error(`Unsupported resume file type: ${fileType}`)
}
