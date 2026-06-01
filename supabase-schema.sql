-- ============================================================================
--  Aperture Studio — Supabase schema
-- ----------------------------------------------------------------------------
--  Run this in the Supabase dashboard:  SQL Editor -> New query -> paste -> Run
--
--  This file is SAFE to run on an existing project — every statement uses
--  "if not exists" / "create or replace", so it will not clobber existing data.
--
--  IMPORTANT — matching YOUR existing schema:
--  The booking API calls the `submit_inquiry()` function below, which writes to
--  these exact columns. If your existing `clients` / `jobs` tables use different
--  column names, edit the INSERT statements inside the function to match.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Tables
-- ---------------------------------------------------------------------------
create table if not exists public.clients (
  client_id   uuid primary key default gen_random_uuid(),
  first_name  text        not null,
  last_name   text        not null,
  company     text,
  phone       text        not null,
  email       text        not null unique,
  created_at  timestamptz not null default now()
);

create table if not exists public.jobs (
  job_id                uuid primary key default gen_random_uuid(),
  client_id             uuid not null references public.clients(client_id) on delete cascade,
  job_type              text not null,                 -- 'Real Estate' | 'Commercial'
  status                text not null default 'Inquiry',
  description           text,                          -- "Property or Job Description"
  preferred_shoot_date  date,
  message               text,
  created_at            timestamptz not null default now()
);

create index if not exists jobs_client_id_idx on public.jobs (client_id);
create index if not exists jobs_status_idx     on public.jobs (status);

-- ---------------------------------------------------------------------------
-- 2. Row Level Security
--    We keep both tables locked down. The public site never reads or writes
--    them directly with the anon key — it can only call submit_inquiry()
--    (defined below), which runs with elevated rights. This means a leaked
--    anon key CANNOT be used to read your clients' contact information.
-- ---------------------------------------------------------------------------
alter table public.clients enable row level security;
alter table public.jobs    enable row level security;

-- (No anon SELECT/INSERT/UPDATE/DELETE policies are created on purpose.)

-- ---------------------------------------------------------------------------
-- 3. Booking function: find-or-create the client, then create the job.
--    Atomic, and the only thing the public form is allowed to call.
-- ---------------------------------------------------------------------------
create or replace function public.submit_inquiry(
  p_first_name           text,
  p_last_name            text,
  p_company              text,
  p_phone                text,
  p_email                text,
  p_job_type             text,
  p_description          text,
  p_preferred_shoot_date date,
  p_message              text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_id uuid;
  v_job_id    uuid;
  v_email     text := lower(trim(p_email));
begin
  if p_first_name is null or btrim(p_first_name) = ''
     or p_last_name is null or btrim(p_last_name) = ''
     or p_phone is null or btrim(p_phone) = ''
     or v_email is null or v_email = ''
     or p_job_type is null or btrim(p_job_type) = '' then
    raise exception 'Missing required fields';
  end if;

  -- Find existing client by email, otherwise create one.
  select client_id into v_client_id
  from public.clients
  where email = v_email;

  if v_client_id is null then
    insert into public.clients (first_name, last_name, company, phone, email)
    values (
      btrim(p_first_name),
      btrim(p_last_name),
      nullif(btrim(coalesce(p_company, '')), ''),
      btrim(p_phone),
      v_email
    )
    returning client_id into v_client_id;
  end if;

  -- Create the linked job with status 'Inquiry'.
  insert into public.jobs (
    client_id, job_type, status, description, preferred_shoot_date, message
  )
  values (
    v_client_id,
    btrim(p_job_type),
    'Inquiry',
    nullif(btrim(coalesce(p_description, '')), ''),
    p_preferred_shoot_date,
    nullif(btrim(coalesce(p_message, '')), '')
  )
  returning job_id into v_job_id;

  return v_job_id;
end;
$$;

-- Allow the public booking form (anon key) and signed-in users to call it.
grant execute on function public.submit_inquiry(
  text, text, text, text, text, text, text, date, text
) to anon, authenticated;
