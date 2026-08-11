-- 107_chat_task_proposal.sql — chat-as-task feature (2026-08-11)
-- The agent can end a reply with a fenced ```task-proposal block (see
-- vps-scripts/yvon-hermes-http/main.py's prompt instruction) when a
-- discussion reaches an actionable conclusion. /api/chat/stream strips that
-- block out of the visible message and emits it as an event instead, same
-- security-definer pattern as chat_emit_input_analysis_event (106). The
-- events table (052) is service-role-insert-only; the dashboard runs under
-- the user session, so this rides a definer writer like the others.
--
-- One function, three kinds via p_kind (mirrors chat_emit_conversation_event's
-- pattern, 106 §7), all written by dashboard/app/api/chat/{stream,task-proposal}:
--   'task.proposed'           — payload {title, summary} — the agent's offer.
--   'task.proposal.dismissed' — payload {} — user answered No / Discuss more,
--                                 so a page reload doesn't re-show a stale
--                                 prompt for a resolved turn.
--   'task.proposal.accepted'  — payload {title, summary, taskId, kanbanOk} —
--                                 user answered Yes; taskId is the real
--                                 TASK-SPEC draft id (store/tasks/<taskId>.yaml).
--
-- Depends on: 052_events.sql (events table), 106_chat_commands.sql (pattern
-- this mirrors exactly).

create or replace function public.chat_emit_task_proposal_event(
  p_context_id  text,
  p_correlation uuid,
  p_room_id     uuid,
  p_author_id   text,
  p_payload     jsonb,
  p_kind        text default 'task.proposed'
)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.events (source, context_id, kind, actor, payload, correlation)
  values (
    'yvon',
    p_context_id,
    coalesce(p_kind, 'task.proposed'),
    p_author_id,
    jsonb_build_object('room_id', p_room_id) || coalesce(p_payload, '{}'::jsonb),
    p_correlation
  );
end;
$$;

revoke all on function public.chat_emit_task_proposal_event(text, uuid, uuid, text, jsonb, text) from public;
grant execute on function public.chat_emit_task_proposal_event(text, uuid, uuid, text, jsonb, text) to authenticated;
