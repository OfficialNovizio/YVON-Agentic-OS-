import type { Archetype } from './archetype';
export type TrioRole = 'primary' | 'adversarial' | 'creative';
export interface TrioCallInput {
    systemPrompt: string;
    task: string;
    ragContext?: string;
}
export interface TrioCallResult {
    role: TrioRole;
    available: boolean;
    provider: string;
    model: string;
    content?: string;
    reason?: string;
}
export interface GenerationTrioResult {
    ranFullTrio: boolean;
    archetype: Archetype;
    reason: string;
    primary: TrioCallResult;
    adversarial?: TrioCallResult;
    creative?: TrioCallResult;
}
export declare function shouldRunFullTrio(archetype: Archetype): boolean;
export interface HttpResponse {
    ok: boolean;
    status: number;
    json(): Promise<any>;
}
export type HttpPost = (url: string, opts: {
    headers: Record<string, string>;
    body: string;
}) => Promise<HttpResponse>;
/** Swap the HTTP layer for tests. Call with no args to restore the real fetch. */
export declare function setHttpPost(fn?: HttpPost): void;
/**
 * runGenerationTrio — Layer 7.1. Always calls primary (Anthropic). Calls
 * adversarial (DeepSeek, via its Anthropic-compatible endpoint — same base
 * URL pattern `dashboard/app/api/claude/route.ts` already uses) and creative
 * (OpenAI) only when `shouldRunFullTrio(archetype)` is true.
 */
export declare function runGenerationTrio(archetype: Archetype, input: TrioCallInput): Promise<GenerationTrioResult>;
//# sourceMappingURL=generation-trio.d.ts.map