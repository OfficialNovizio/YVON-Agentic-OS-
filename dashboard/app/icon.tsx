// App icon — Next 15 native. Auto-generated at build time via @vercel/og.
// Serves both 192×192 and 512×512 (Chrome/Android). Also used for /favicon.ico.
// Owner: mia · TS-014 WI-2
import { ImageResponse } from 'next/og'

export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #6366F1 0%, #5ee0ff 100%)',
          borderRadius: 96,
          fontSize: 320,
          fontWeight: 900,
          color: '#06121f',
          fontFamily: '"SF Pro", "Segoe UI", -apple-system, sans-serif',
        }}
      >
        Y
      </div>
    ),
    { ...size }
  )
}
