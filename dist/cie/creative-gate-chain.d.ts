import type { RagRetrieveResult } from './rag-bridge';
export interface BrandVoiceResult {
    status: 'not_configured' | 'checked';
    brandKitPath?: string;
    voiceGuidePath?: string;
    reason: string;
}
export declare function checkBrandVoiceConformance(brandId: string): BrandVoiceResult;
export type NoveltyFlag = 'repetitive' | 'brand_drift_check' | 'unscored';
export interface NoveltyResult {
    flag: NoveltyFlag;
    hitCount: number;
    available: boolean;
    note: string;
}
export declare function checkNoveltyRepetition(draftSummary: string, wing: string, opts?: {
    room?: string;
    recentN?: number;
}): NoveltyResult;
export interface PremortemResult {
    hasAdversaryChunk: boolean;
    adversaryChunkIds: string[];
    note: string;
}
export declare function checkPremortemRisk(ragResult: RagRetrieveResult): PremortemResult;
export interface PredictedPerformanceResult {
    available: false;
    reason: string;
}
export declare function checkPredictedPerformance(): PredictedPerformanceResult;
export interface CreativeOutcome {
    postId: string;
    wing: string;
    likes?: number;
    saves?: number;
    shares?: number;
    clickThroughRate?: number;
    publishedAt: string;
    measuredAt: string;
}
export declare function recordCreativeOutcome(outcome: CreativeOutcome): {
    filed: boolean;
    error?: string;
};
//# sourceMappingURL=creative-gate-chain.d.ts.map