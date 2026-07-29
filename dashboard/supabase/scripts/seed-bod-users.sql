-- seed-bod-users.sql — RUN VIA execute_sql / psql, NEVER via apply_migration.
--
-- Creates or rotates passwords for the 3 BOD accounts. Idempotent — safe to
-- re-run to rotate credentials. Passwords ARE in this file, so:
--   • rotate them regularly
--   • never commit new passwords to a public branch
--   • prefer running via the Supabase Studio SQL editor or CLI, not CI
--
-- After first run, verify:
--   select email, role from public.profiles order by created_at;
--   (Expect 3 rows: novy738 owner, sagar739 bod_member, amit740 bod_member)

do $$
declare
  seed_users constant text[][] := array[
    array['novy738@yvon.internal',  'REPLACE_ME'],
    array['sagar739@yvon.internal', 'REPLACE_ME'],
    array['amit740@yvon.internal',  'REPLACE_ME']
  ];
  i int;
  new_id uuid;
begin
  for i in 1 .. array_length(seed_users, 1) loop
    perform 1 from auth.users where email = seed_users[i][1];

    if not found then
      new_id := gen_random_uuid();
      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data,
        confirmation_token, email_change, email_change_token_new, recovery_token
      ) values (
        '00000000-0000-0000-0000-000000000000',
        new_id,
        'authenticated',
        'authenticated',
        seed_users[i][1],
        crypt(seed_users[i][2], gen_salt('bf')),
        now(), now(), now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{}'::jsonb,
        '', '', '', ''
      );
      insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      values (
        gen_random_uuid(),
        new_id,
        seed_users[i][1],
        jsonb_build_object('sub', new_id::text, 'email', seed_users[i][1], 'email_verified', true, 'phone_verified', false),
        'email',
        now(), now(), now()
      );
    else
      update auth.users
      set encrypted_password = crypt(seed_users[i][2], gen_salt('bf')),
          updated_at = now()
      where email = seed_users[i][1];
    end if;
  end loop;
end $$;
