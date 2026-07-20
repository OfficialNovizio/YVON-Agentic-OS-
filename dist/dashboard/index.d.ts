import { IncomingMessage, ServerResponse } from 'http';
/**
 * Start the TOON Dashboard HTTP server.
 *
 * Serves a single-page dashboard at the given port (default: 4200).
 * Includes codebase graph, CIE pipeline, agent cards, and token gauge.
 *
 * Returns the http.Server instance. Call .close() to stop.
 *
 * @param port - Port to listen on (default: 4200)
 */
export declare function startDashboard(port?: number): import("http").Server<typeof IncomingMessage, typeof ServerResponse>;
//# sourceMappingURL=index.d.ts.map