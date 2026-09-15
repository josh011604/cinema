-- ==========================================================================
-- Cinema House - database schema for Supabase
--
-- Run this whole file in Supabase: SQL Editor -> New query -> paste -> Run.
-- It is safe to run again; nothing is duplicated or deleted.
-- ==========================================================================


-- --------------------------------------------------------------------------
-- Admins
-- Signing in is not enough to manage the website: the account must also be
-- listed here. See the bottom of this file for how to add yourself.
-- --------------------------------------------------------------------------

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

drop policy if exists "Admins can see their own row" on public.admins;
create policy "Admins can see their own row" on public.admins
  for select to authenticated
  using (user_id = auth.uid());

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;


-- --------------------------------------------------------------------------
-- Movies
-- Everyone can read the catalog; only admins can change it.
-- --------------------------------------------------------------------------

create table if not exists public.movies (
  id text primary key,
  title text not null,
  genres text[] not null default '{}',
  age_rating text not null default '12+',
  duration integer not null check (duration between 20 and 400),
  year integer,
  score numeric(3, 1),
  director text not null default '',
  cast_members text[] not null default '{}',
  format text[] not null default '{}',
  status text not null default 'now-showing' check (status in ('now-showing', 'coming-soon')),
  release_date date,
  tagline text not null default '',
  synopsis text not null default '',
  poster_url text,
  art jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Cinema rooms a film plays in (hall ids from src/data/halls.js). Added as its
-- own step so projects created before rooms existed pick it up on a re-run.
alter table public.movies add column if not exists halls text[] not null default '{}';

-- Screenings the admin schedules for a film, for example
-- [{ "date": "2026-09-20", "time": "14:30", "hallId": "hall-1" }].
-- The website works out each screening's end time from the film's runtime.
alter table public.movies add column if not exists screenings jsonb not null default '[]'::jsonb;

-- Cinema House has no 3D hall, so 3D is not offered as a format.
update public.movies
set format = array_remove(format, '3D')
where '3D' = any (format);

alter table public.movies enable row level security;

drop policy if exists "Anyone can read movies" on public.movies;
create policy "Anyone can read movies" on public.movies
  for select
  using (true);

drop policy if exists "Admins can add movies" on public.movies;
create policy "Admins can add movies" on public.movies
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can edit movies" on public.movies;
create policy "Admins can edit movies" on public.movies
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can remove movies" on public.movies;
create policy "Admins can remove movies" on public.movies
  for delete to authenticated
  using (public.is_admin());


-- --------------------------------------------------------------------------
-- Bookings
-- Customers never read this table directly (it holds names, emails and phone
-- numbers). They use the functions below instead; admins get full access.
-- --------------------------------------------------------------------------

create table if not exists public.bookings (
  code text primary key,
  movie_id text not null,
  movie_title text not null,
  showtime_id text not null,
  show_date date not null,
  show_time text not null,
  hall_id text not null,
  hall_name text not null,
  format text not null default '',
  seats jsonb not null,
  seat_ids text[] not null,
  customer jsonb not null,
  payment jsonb not null,
  subtotal numeric(10, 2) not null,
  fees numeric(10, 2) not null,
  total numeric(10, 2) not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'used', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists bookings_showtime_idx on public.bookings (showtime_id);
create index if not exists bookings_created_idx on public.bookings (created_at desc);

alter table public.bookings enable row level security;

drop policy if exists "Admins can read bookings" on public.bookings;
create policy "Admins can read bookings" on public.bookings
  for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins can update bookings" on public.bookings;
create policy "Admins can update bookings" on public.bookings
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete bookings" on public.bookings;
create policy "Admins can delete bookings" on public.bookings
  for delete to authenticated
  using (public.is_admin());

-- Seats already sold for one screening (seat ids only, no customer details).
create or replace function public.taken_seats(p_showtime_id text)
returns text[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(distinct seat), '{}')
  from public.bookings, unnest(seat_ids) as seat
  where showtime_id = p_showtime_id
    and status <> 'cancelled';
$$;

-- Looks up one booking by its code, for the confirmation page.
create or replace function public.get_booking(p_code text)
returns setof public.bookings
language sql
stable
security definer
set search_path = public
as $$
  select * from public.bookings where code = upper(trim(p_code)) limit 1;
$$;

-- Creates a booking. Checkouts for the same screening are handled one at a
-- time, so two customers can never buy the same seat.
create or replace function public.create_booking(p jsonb)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_showtime text := p ->> 'showtimeId';
  v_seat_ids text[];
  v_clash text[];
  v_code text;
  v_row public.bookings;
begin
  select array_agg(item ->> 'id')
    into v_seat_ids
  from jsonb_array_elements(coalesce(p -> 'seats', '[]'::jsonb)) as item;

  if v_showtime is null or v_seat_ids is null or cardinality(v_seat_ids) > 10 then
    raise exception 'INVALID_BOOKING';
  end if;

  perform pg_advisory_xact_lock(hashtext(v_showtime));

  select array_agg(distinct seat)
    into v_clash
  from public.bookings, unnest(seat_ids) as seat
  where showtime_id = v_showtime
    and status <> 'cancelled'
    and seat = any (v_seat_ids);

  if v_clash is not null then
    raise exception 'SEATS_TAKEN:%', array_to_string(v_clash, ',');
  end if;

  loop
    select 'CH-' || string_agg(substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1), '')
      into v_code
    from generate_series(1, 6);
    exit when not exists (select 1 from public.bookings where code = v_code);
  end loop;

  insert into public.bookings (
    code, movie_id, movie_title, showtime_id, show_date, show_time, hall_id, hall_name, format,
    seats, seat_ids, customer, payment, subtotal, fees, total
  ) values (
    v_code,
    p ->> 'movieId',
    p ->> 'movieTitle',
    v_showtime,
    (p ->> 'date')::date,
    p ->> 'time',
    p ->> 'hallId',
    p ->> 'hallName',
    coalesce(p ->> 'format', ''),
    p -> 'seats',
    v_seat_ids,
    p -> 'customer',
    p -> 'payment',
    (p ->> 'subtotal')::numeric,
    (p ->> 'fees')::numeric,
    (p ->> 'total')::numeric
  )
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.taken_seats(text) to anon, authenticated;
grant execute on function public.get_booking(text) to anon, authenticated;
grant execute on function public.create_booking(jsonb) to anon, authenticated;


-- --------------------------------------------------------------------------
-- Settings
-- Site-wide values the admin manages, such as ticket prices. Everyone can read
-- them (the booking pages need the prices); only admins can change them.
-- --------------------------------------------------------------------------

create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

drop policy if exists "Anyone can read settings" on public.settings;
create policy "Anyone can read settings" on public.settings
  for select
  using (true);

drop policy if exists "Admins can add settings" on public.settings;
create policy "Admins can add settings" on public.settings
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can change settings" on public.settings;
create policy "Admins can change settings" on public.settings
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Starting ticket prices (in pesos). Only inserted when none are saved yet.
insert into public.settings (key, value)
values (
  'pricing',
  '{"imax": {"standard": 280, "vip": 420, "sofa": 650}, "standard": {"standard": 280, "vip": 420, "sofa": 650}, "bookingFee": 20}'::jsonb
)
on conflict (key) do nothing;


-- --------------------------------------------------------------------------
-- Poster images
-- A public bucket: anyone can view posters, only admins can upload or delete.
-- --------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('posters', 'posters', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins can list posters" on storage.objects;
create policy "Admins can list posters" on storage.objects
  for select to authenticated
  using (bucket_id = 'posters' and public.is_admin());

drop policy if exists "Admins can upload posters" on storage.objects;
create policy "Admins can upload posters" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'posters' and public.is_admin());

drop policy if exists "Admins can update posters" on storage.objects;
create policy "Admins can update posters" on storage.objects
  for update to authenticated
  using (bucket_id = 'posters' and public.is_admin());

drop policy if exists "Admins can delete posters" on storage.objects;
create policy "Admins can delete posters" on storage.objects
  for delete to authenticated
  using (bucket_id = 'posters' and public.is_admin());


-- --------------------------------------------------------------------------
-- Add an admin
-- Staff sign in on the website with a USERNAME. Supabase still needs an email,
-- so enter the username followed by @cinemahouse.local (no mail is ever sent).
-- 1. Authentication -> Users -> Add user -> Create new user
--    Email: yourusername@cinemahouse.local, a strong password,
--    and tick "Auto Confirm User".
-- 2. Run the line below with that same address:
--
--    insert into public.admins (user_id)
--    select id from auth.users where email = 'yourusername@cinemahouse.local'
--    on conflict do nothing;
-- --------------------------------------------------------------------------
