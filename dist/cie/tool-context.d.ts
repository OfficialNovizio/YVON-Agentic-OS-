export interface ToolContextChunk {
    chunk_id: string;
    source_file: string;
    chunk_text: string;
    citation: string;
    department?: string;
    tool_name: string;
    called_at: string;
}
/**
 * materializeToolContext — writes a live tool call's output to disk under
 * store/tool-context-cache/ and returns a chunk-shaped object pointing at that real file, so it
 * can be passed into GATE the same way any retrieved chunk is (Gate 1's source_file existence
 * check will find a real file, not a synthetic path).
 */
export declare function materializeToolContext(toolName: string, output: string, opts?: {
    department?: string;
    citation?: string;
}): ToolContextChunk;
//# sourceMappingURL=tool-context.d.ts.map