// ponytail: one shared helper instead of the same ternary repeated in 70+ route.ts files.
export const errMsg = (e: unknown): string => (e instanceof Error ? e.message : String(e))
