-- Migration 027: Morning Brief
-- Table: weekly_goals

create table if not exists weekly_goals (
  id         uuid        primary key default gen_random_uuid(),
  week_start date        not null,   -- ISO Monday of the week
  goal       text        not null,
  completed  boolean     not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_weekly_goals_week on weekly_goals(week_start desc);
