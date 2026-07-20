# Stack Notes — React/Next.js Patterns (dated 2026-07)

**Applies only when the business's stack-profile names React/Next.js.** Method authority: mia's custom skills (`frontend-performance` for perf, `ui-accessibility-standards` for a11y — conflicts resolve there). Source: affaan-m/everything-claude-code `frontend-patterns`, adopted 2026-07-10, condensed.

## Component patterns
- **Composition over inheritance:** small typed components assembled (`Card` + `CardHeader` + `CardBody`), never class hierarchies.
- **Compound components:** shared state via context (`Tabs`/`Tab` with `TabsContext`); throw a clear error when a child is used outside its provider.
- **Render props** for reusable data-loading wrappers when hooks don't fit.

## Hooks
- Custom hooks for any reused logic: `useToggle`, `useDebounce(value, delay)`.
- Data-fetching hook trap (source's hard-won note): keep `fetcher`/`options` in **refs** so `refetch` stays referentially stable — inline function/object props otherwise recreate the callback every render → infinite fetch loop.

## State
- Context + reducer for feature-level state (typed action unions); hook accessor throws outside provider.
- Functional updates always (`setX(prev => ...)`).
- Heavier stores (Zustand etc.) per stack-profile.

## Performance (feeds frontend-performance's measured-wins rule)
- `useMemo` for expensive computes — **copy before sort** (`[...markets].sort(...)`; sort mutates).
- `useCallback` for functions passed to children; `React.memo` for pure list items.
- Code-split heavy components (`lazy` + `Suspense` with skeleton fallbacks).
- Virtualize long lists (@tanstack/react-virtual: estimated row height + overscan).
- All still subject to frontend-performance's rule: measure first, keep only measured wins.

## Forms
Controlled inputs + typed `FormData`/`FormErrors` · validate before submit, per-field error display · schema validation (Zod) shared with the API edge where possible.

## Error boundaries
Class-based `ErrorBoundary` (`getDerivedStateFromError` + `componentDidCatch`) wrapping the app/feature roots with a retry fallback.

## Accessibility (cross-ref: ui-accessibility-standards owns the checklist)
Keyboard navigation on custom widgets (Arrow/Enter/Escape handling, `role`/`aria-expanded`/`aria-haspopup`) · modal focus management (save previous focus, focus dialog on open, restore on close, `aria-modal`, Escape closes).

## Animation
AnimatePresence/motion patterns (list enter/exit, modal overlay+content) — respect reduced-motion per ui-accessibility-standards.
