-- 105_chat_attachments.sql — TS-016 WI-1
-- Files, images, voice memos attached to chat messages.
-- Applied to Supabase project cjjllgexiecesgwenpph on 2026-07-30.

create table if not exists public.chat_attachments (
  id                 uuid primary key default gen_random_uuid(),
  message_id         uuid not null references public.chat_messages(id) on delete cascade,
  uploader_user_id   uuid not null references public.profiles(id) on delete cascade,
  storage_path       text not null,
  filename           text not null,
  mime_type          text not null,
  size_bytes         bigint not null,
  duration_ms        integer,
  waveform           jsonb,
  created_at         timestamptz not null default now()
);

create index if not exists chat_attachments_message on public.chat_attachments (message_id);

alter table public.chat_attachments enable row level security;

drop policy if exists "chat_attachments_read" on public.chat_attachments;
create policy "chat_attachments_read" on public.chat_attachments
  for select using (
    exists (
      select 1 from public.chat_messages m
      where m.id = message_id and public.can_see_room(m.room_id)
    )
  );

drop policy if exists "chat_attachments_insert" on public.chat_attachments;
create policy "chat_attachments_insert" on public.chat_attachments
  for insert with check (
    uploader_user_id = auth.uid()
    and exists (
      select 1 from public.chat_messages m
      where m.id = message_id and public.can_see_room(m.room_id)
    )
  );

drop policy if exists "chat_attachments_delete" on public.chat_attachments;
create policy "chat_attachments_delete" on public.chat_attachments
  for delete using (uploader_user_id = auth.uid() or public.is_owner());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('chat-uploads', 'chat-uploads', false, 26214400, null)
on conflict (id) do update
set file_size_limit = 26214400,
    public = false;

drop policy if exists "chat_uploads_read" on storage.objects;
create policy "chat_uploads_read" on storage.objects
  for select using (bucket_id = 'chat-uploads' and auth.role() = 'authenticated');

drop policy if exists "chat_uploads_insert" on storage.objects;
create policy "chat_uploads_insert" on storage.objects
  for insert with check (
    bucket_id = 'chat-uploads' and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "chat_uploads_delete" on storage.objects;
create policy "chat_uploads_delete" on storage.objects
  for delete using (
    bucket_id = 'chat-uploads' and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

comment on table public.chat_attachments is 'Files/images/voice memos linked to chat messages. TS-016.';
