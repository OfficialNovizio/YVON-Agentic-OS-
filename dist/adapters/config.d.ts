export interface EngineConfig {
    projectRoot: string;
    teamsPath: string;
    sharedOsPath: string;
    booksPath: string;
    graphifyReport: string;
    graphifyGraphJson: string;
    codegraphReport: string;
    agentMemoryDir: string;
    hermesMemoryDir: string;
    projectClaudePath: string;
    ventureDocsDir: string;
    sessionMemoryDir: string;
    cieEnabled: boolean;
    contextCap: number;
    adaptiveInjection: boolean;
    toonPreferCompressed: boolean;
    citationInjection: boolean;
    pipelineOrchestration: boolean;
    toonEnabled: boolean;
    toonBidirectional: boolean;
}
export declare function getConfig(): EngineConfig;
export declare function invalidateConfig(): void;
//# sourceMappingURL=config.d.ts.map