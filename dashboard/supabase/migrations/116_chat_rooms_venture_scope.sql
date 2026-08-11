-- 116_chat_rooms_venture_scope.sql — per-venture chat rooms (2026-08-11)
-- Discovery: switching the venture selector never changed which messages
-- showed — activeRoom in app/chat/page.tsx matches purely on (kind,
-- department/agentId), with zero venture dimension anywhere in chat_rooms or
-- chat_messages. User decision: every room kind (workforce, department,
-- agent, assigned_scope) becomes per-venture; existing rows/history stay
-- venture_slug=NULL — the "default/shared" room, untouched, not reassigned.
--
-- Four existing unique indexes (each a Postgres partial-unique trick, one per
-- room kind) get replaced with a NULL-vs-non-NULL pair apiece rather than a
-- single COALESCE expression index — /api/chat/rooms/route.ts's own comment
-- already flags why: Postgres ON CONFLICT can't target a partial/expression
-- index via a plain column list, so provisioning always goes through
-- find-then-insert-then-retry-on-race, never .upsert(onConflict:). Splitting
-- into two plain-column partial indexes (one WHERE venture_slug IS NULL, one
-- WHERE venture_slug IS NOT NULL) keeps that same simple, working pattern.

ALTER TABLE public.chat_rooms ADD COLUMN IF NOT EXISTS venture_slug TEXT;

DROP INDEX IF EXISTS chat_rooms_dept_unique;
DROP INDEX IF EXISTS chat_rooms_whole_team_unique;
DROP INDEX IF EXISTS chat_rooms_agent_unique;
DROP INDEX IF EXISTS chat_rooms_assigned_scope_unique;

CREATE UNIQUE INDEX chat_rooms_dept_default_unique
  ON public.chat_rooms (department) WHERE kind = 'department' AND venture_slug IS NULL;
CREATE UNIQUE INDEX chat_rooms_dept_venture_unique
  ON public.chat_rooms (department, venture_slug) WHERE kind = 'department' AND venture_slug IS NOT NULL;

CREATE UNIQUE INDEX chat_rooms_whole_team_default_unique
  ON public.chat_rooms ((true)) WHERE kind = 'whole_team' AND venture_slug IS NULL;
CREATE UNIQUE INDEX chat_rooms_whole_team_venture_unique
  ON public.chat_rooms (venture_slug) WHERE kind = 'whole_team' AND venture_slug IS NOT NULL;

CREATE UNIQUE INDEX chat_rooms_agent_default_unique
  ON public.chat_rooms (owner_user_id, agent_id) WHERE kind = 'agent' AND venture_slug IS NULL;
CREATE UNIQUE INDEX chat_rooms_agent_venture_unique
  ON public.chat_rooms (owner_user_id, agent_id, venture_slug) WHERE kind = 'agent' AND venture_slug IS NOT NULL;

CREATE UNIQUE INDEX chat_rooms_assigned_scope_default_unique
  ON public.chat_rooms (owner_user_id) WHERE kind = 'assigned_scope' AND venture_slug IS NULL;
CREATE UNIQUE INDEX chat_rooms_assigned_scope_venture_unique
  ON public.chat_rooms (owner_user_id, venture_slug) WHERE kind = 'assigned_scope' AND venture_slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_chat_rooms_venture_slug ON public.chat_rooms (venture_slug);
