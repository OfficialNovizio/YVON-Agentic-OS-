import type { Archetype } from './archetype';
import type { RagRetrieveParams } from './rag-bridge';
export interface RetrievalShape {
    topK: number;
    retrievalMode: NonNullable<RagRetrieveParams['retrievalMode']>;
    note: string;
}
export declare function resolveRetrievalShape(archetype: Archetype): RetrievalShape;
//# sourceMappingURL=retrieval-shape.d.ts.map