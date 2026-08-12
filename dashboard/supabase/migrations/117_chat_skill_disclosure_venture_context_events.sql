-- 117_chat_skill_disclosure_venture_context_events.sql — 2026-08-11
-- Closes a gap flagged directly in lib/pipeline.ts's own comments: SKILL
-- DISCLOSURE (phase 02) and RESOLVE (phase 03) both emit real live SSE
-- events (skill.disclosure, venture.context in stream/route.ts) but neither
-- was ever persisted to public.events — so a page reload always showed
-- "awaiting phase.disclosure event" / the sparse Hermes-only phase.resolve
-- fallback for those two, no matter how complete the turn's correlation is.
-- CLASSIFY didn't have this problem — chat_emit_input_analysis_event
-- (migration 106) already exists and lib/pipeline.ts's stageFromEventRow
-- already has a correct 'input.analysis' case.
--
-- Same security-definer writer pattern as chat_emit_input_analysis_event.

-- ── skill.disclosure — phase 02 ─────────────────────────────────────────────
create or replace function public.chat_emit_skill_disclosure_event(
  p_context_id  text,
  p_correlation uuid,
  p_room_id     uuid,
  p_author_id   text,
  p_payload     jsonb
)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.events (source, context_id, kind, actor, payload, correlation)
  values (
    'yvon',
    p_context_id,
    'skill.disclosure',
    p_author_id,
    coalesce(p_payload, '{}'::jsonb),
    p_correlation
  );
end;
$$;

revoke all on function public.chat_emit_skill_disclosure_event(text, uuid, uuid, text, jsonb) from public;
grant execute on function public.chat_emit_skill_disclosure_event(text, uuid, uuid, text, jsonb) to authenticated;

-- ── venture.context — phase 03 (RESOLVE) ────────────────────────────────────
create or replace function public.chat_emit_venture_context_event(
  p_context_id  text,
  p_correlation uuid,
  p_room_id     uuid,
  p_author_id   text,
  p_payload     jsonb
)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.events (source, context_id, kind, actor, payload, correlation)
  values (
    'yvon',
    p_context_id,
    'venture.context',
    p_author_id,
    coalesce(p_payload, '{}'::jsonb),
    p_correlation
  );
end;
$$;

revoke all on function public.chat_emit_venture_context_event(text, uuid, uuid, text, jsonb) from public;
grant execute on function public.chat_emit_venture_context_event(text, uuid, uuid, text, jsonb) to authenticated;
