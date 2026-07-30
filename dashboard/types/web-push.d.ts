// Temporary type shim for web-push so tsc passes before `npm install`.
// When the real @types/web-push is installed, its types override this.
// Safe to delete post-install.
// TS-014.

declare module 'web-push' {
  export interface PushSubscription {
    endpoint: string
    keys: { p256dh: string; auth: string }
  }
  export interface RequestOptions {
    TTL?: number
    urgency?: 'very-low' | 'low' | 'normal' | 'high'
    topic?: string
    headers?: Record<string, string>
  }
  export interface SendResult {
    statusCode: number
    body?: string
    headers?: Record<string, string>
  }
  export function setVapidDetails(subject: string, publicKey: string, privateKey: string): void
  export function sendNotification(
    subscription: PushSubscription,
    payload?: string | Buffer,
    options?: RequestOptions
  ): Promise<SendResult>
  export function generateVAPIDKeys(): { publicKey: string; privateKey: string }

  const _default: {
    setVapidDetails: typeof setVapidDetails
    sendNotification: typeof sendNotification
    generateVAPIDKeys: typeof generateVAPIDKeys
  }
  export default _default
}
