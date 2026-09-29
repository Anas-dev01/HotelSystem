-- Run this once in Supabase Dashboard -> SQL Editor.
-- It makes paid the only payment state and prevents overlapping active stays.

create extension if not exists btree_gist;

-- Before adding the overlap rule, run resolve_booking_conflicts.sql separately.
-- If it returns rows, cancel or correct one booking in each pair before continuing.
select
  first_booking.id as first_booking_id,
  second_booking.id as conflicting_booking_id,
  first_booking.room_id,
  first_booking.check_in,
  first_booking.check_out,
  second_booking.check_in as conflicting_check_in,
  second_booking.check_out as conflicting_check_out
from public.bookings first_booking
join public.bookings second_booking
  on first_booking.room_id = second_booking.room_id
  and first_booking.id < second_booking.id
  and first_booking.check_in < second_booking.check_out
  and first_booking.check_out > second_booking.check_in
  and first_booking.status not in ('cancelled', 'checked-out')
  and second_booking.status not in ('cancelled', 'checked-out');

update public.bookings
set payment_status = 'paid'
where payment_status is distinct from 'paid';

alter table public.bookings
  alter column payment_status set default 'paid';

alter table public.bookings
  drop constraint if exists bookings_payment_status_paid;

alter table public.bookings
  add constraint bookings_payment_status_paid check (payment_status = 'paid');

alter table public.bookings
  drop constraint if exists bookings_valid_stay_dates;

alter table public.bookings
  add constraint bookings_valid_stay_dates check (check_out > check_in);

-- [) means a stay ending on 2026-08-12 does not conflict with one starting that day.
-- Cancelled and checked-out rows do not block a later booking.
alter table public.bookings
  drop constraint if exists bookings_no_overlapping_active_stays;

alter table public.bookings
  add constraint bookings_no_overlapping_active_stays
  exclude using gist (
    room_id with =,
    daterange(check_in, check_out, '[)') with &&
  ) where (status not in ('cancelled', 'checked-out'));

-- A staff helper used by the room-management policies below.
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('manager', 'receptionist')
  );
$$;

grant execute on function public.is_staff() to authenticated;

alter table public.rooms enable row level security;

drop policy if exists "staff manage rooms" on public.rooms;
create policy "staff manage rooms" on public.rooms
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- Do not use a public/anon write policy in production. It lets anyone on the
-- internet change or erase hotel data. If all signed-in staff should edit rooms,
-- give every employee a profiles.role of manager or receptionist; the policy
-- above already grants them full room management, including maintenance status.
