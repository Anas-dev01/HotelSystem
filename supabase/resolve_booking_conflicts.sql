-- Run this first when booking_safety.sql reports an overlap error.
-- It shows the full details of every pair of active bookings that conflicts.

select
  first_booking.id as first_booking_id,
  first_booking.created_at as first_created_at,
  first_booking.status as first_status,
  first_booking.check_in as first_check_in,
  first_booking.check_out as first_check_out,
  second_booking.id as second_booking_id,
  second_booking.created_at as second_created_at,
  second_booking.status as second_status,
  second_booking.check_in as second_check_in,
  second_booking.check_out as second_check_out,
  rooms.room_number,
  first_guest.full_name as first_guest_name,
  second_guest.full_name as second_guest_name
from public.bookings first_booking
join public.bookings second_booking
  on first_booking.room_id = second_booking.room_id
  and first_booking.id < second_booking.id
  and first_booking.check_in < second_booking.check_out
  and first_booking.check_out > second_booking.check_in
  and first_booking.status not in ('cancelled', 'checked-out')
  and second_booking.status not in ('cancelled', 'checked-out')
join public.rooms rooms on rooms.id = first_booking.room_id
left join public.guests first_guest on first_guest.id = first_booking.guest_id
left join public.guests second_guest on second_guest.id = second_booking.guest_id;

-- After choosing the incorrect/duplicate booking from the query above, cancel it
-- by replacing the placeholder with its ID. This preserves the audit record.
--
-- update public.bookings
-- set status = 'cancelled'
-- where id = 'paste-the-booking-id-to-cancel-here';

-- If both bookings are real, edit one booking's dates instead of cancelling it.
--
-- update public.bookings
-- set check_in = '2026-09-05', check_out = '2026-09-08'
-- where id = 'paste-the-booking-id-to-move-here';
