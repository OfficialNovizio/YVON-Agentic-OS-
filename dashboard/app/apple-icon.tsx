// iOS home-screen icon. Next 15 native — auto-serves at /apple-icon.
// Apple wants 180×180 without transparent corners (iOS masks it automatically).
// Owner: mia · TS-014 WI-2
import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
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
          // No border-radius — iOS applies the mask itself.
          fontSize: 108,
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
