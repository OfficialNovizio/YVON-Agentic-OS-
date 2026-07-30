// Browser-side file uploader for chat attachments.
// Uploads to Supabase Storage bucket 'chat-uploads' under {userId}/{uuid}-{filename}.
// Returns the storage_path — persistence to chat_attachments happens server-side
// after the message row exists.
// Owner: mia · TS-016 WI-2
'use client'

import { supabaseBrowser } from './supabase-browser'

export const MAX_FILE_BYTES = 25 * 1024 * 1024 // 25 MB
export const MAX_FILES_PER_MESSAGE = 10
export const BUCKET = 'chat-uploads'

export interface UploadedAttachment {
  storagePath: string
  filename: string
  mimeType: string
  sizeBytes: number
  // For audio: caller populates duration_ms + waveform
  durationMs?: number
  waveform?: number[]
}

export interface UploadedError {
  filename: string
  error: string
}

export interface UploadResult {
  uploaded: UploadedAttachment[]
  errors: UploadedError[]
}

/** Validate + upload one file to Supabase Storage. Never throws. */
async function uploadOne(file: File, userId: string): Promise<
  | { ok: true; upload: UploadedAttachment }
  | { ok: false; error: string }
> {
  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, error: `too large (${(file.size / 1024 / 1024).toFixed(1)} MB > 25 MB)` }
  }
  if (file.size === 0) {
    return { ok: false, error: 'empty file' }
  }

  // Path shape: <userId>/<uuid>-<safeFilename>
  const uuid = (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)) as string
  const safeName = file.name.replace(/[^\w.\-]+/g, '_').slice(0, 200)
  const path = `${userId}/${uuid}-${safeName}`

  const supabase = supabaseBrowser()
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || 'application/octet-stream',
    cacheControl: '3600',
    upsert: false,
  })
  if (error) {
    return { ok: false, error: error.message ?? 'upload failed' }
  }

  return {
    ok: true,
    upload: {
      storagePath: path,
      filename: file.name,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
    },
  }
}

/**
 * Upload multiple files. Enforces the count cap and reports per-file failures.
 * Files are uploaded in parallel; the response preserves input order.
 */
export async function uploadFiles(files: File[], userId: string): Promise<UploadResult> {
  const capped = files.slice(0, MAX_FILES_PER_MESSAGE)
  const rejected = files.slice(MAX_FILES_PER_MESSAGE)

  const results = await Promise.all(capped.map((f) => uploadOne(f, userId)))
  const uploaded: UploadedAttachment[] = []
  const errors: UploadedError[] = []

  results.forEach((r, i) => {
    if (r.ok) uploaded.push(r.upload)
    else errors.push({ filename: capped[i].name, error: r.error })
  })
  rejected.forEach((f) => {
    errors.push({ filename: f.name, error: `exceeded ${MAX_FILES_PER_MESSAGE}-file limit` })
  })

  return { uploaded, errors }
}

/** Signed URL for reading — use in the UI to show attachments. Cached client-side. */
export async function signedUrl(storagePath: string, expiresInSec = 60 * 60): Promise<string | null> {
  const supabase = supabaseBrowser()
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, expiresInSec)
  if (error || !data) return null
  return data.signedUrl
}
