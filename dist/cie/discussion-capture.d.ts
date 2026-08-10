import { type MemPalaceMineResult } from './sources/mempalace';
export declare const DECISION_WING = "meta-architecture";
export interface DecisionNodeInput {
    id: string;
    scope: string;
    appliesTo: string[];
    body: string;
    learnedFrom?: string;
    supersedes?: string;
}
export interface CaptureDiscussionResult {
    filePath: string;
    written: true;
    graphifyIndexed: false;
    memPalace: MemPalaceMineResult;
}
/**
 * captureDiscussion — §15.3's mechanism. Writes a §4-shaped Decision node file and mines it into
 * MemPalace. Does not touch graphify — see module comment for why that half of the doc's claim
 * isn't real today.
 */
export declare function captureDiscussion(input: DecisionNodeInput): CaptureDiscussionResult;
//# sourceMappingURL=discussion-capture.d.ts.map