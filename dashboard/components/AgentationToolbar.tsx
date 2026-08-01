'use client';

/**
 * Agentation — visual feedback toolbar (DEV-ONLY).
 * Click elements in the running app, annotate, copy structured selectors
 * that agents can grep for. Feedback IN (opposite direction to reticle).
 * mia's frontend-verification skill. https://github.com/benjitaylor/agentation
 *
 * Load discipline (only-needed-loads): this component returns null outside
 * `next dev`, so the `agentation` import is dead code in the production build
 * and Next/webpack tree-shakes it out — zero bytes shipped to users.
 */

import { Agentation } from 'agentation';

export default function AgentationToolbar() {
  if (process.env.NODE_ENV !== 'development') return null;
  return <Agentation />;
}
