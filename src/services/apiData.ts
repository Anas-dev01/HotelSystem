import { supabase } from "@/lib/supabase";

export const getRooms = async () => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('room_number', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

export const getBookings = async () => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      guests (full_name, email, phone),
      rooms (room_number, type)
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

const datesOverlap = (checkIn: string, checkOut: string, existingCheckIn: string, existingCheckOut: string) =>
  checkIn < existingCheckOut && checkOut > existingCheckIn;

const blocksRoom = (booking: any) => !['cancelled', 'checked-out'].includes(booking.status);

export const getAvailableRoomsForDates = async (checkIn: string, checkOut: string) => {
  const [rooms, bookings] = await Promise.all([getRooms(), getBookings()]);
  if (!checkIn || !checkOut) return rooms.filter((room: any) => room.status === 'available');

  const unavailableRoomIds = new Set(
    bookings
      .filter((booking: any) => blocksRoom(booking) && datesOverlap(checkIn, checkOut, booking.check_in, booking.check_out))
      .map((booking: any) => booking.room_id)
  );

  return rooms.filter((room: any) => room.status === 'available' && !unavailableRoomIds.has(room.id));
};

export const createBooking = async (bookingData: any) => {
  let guestId = bookingData.guestId;

  // If no guestId exists, it's a new guest. Create them first.
  if (!guestId) {
    const { data: newGuest, error: guestError } = await supabase
      .from('guests')
      .insert([{ 
        full_name: bookingData.guestName, 
        email: bookingData.email, 
        phone: bookingData.phone // Added phone number
      }])
      .select()
      .single();

    if (guestError) throw new Error(guestError.message);
    guestId = newGuest.id;
  }

  const { data: conflictingBookings, error: availabilityError } = await supabase
    .from('bookings')
    .select('id, check_in, check_out, status')
    .eq('room_id', bookingData.roomId)
    .not('status', 'in', '(cancelled,checked-out)')
    .lt('check_in', bookingData.checkOut)
    .gt('check_out', bookingData.checkIn);

  if (availabilityError) throw new Error(availabilityError.message);
  if (conflictingBookings?.length) {
    throw new Error('This room is no longer available for the selected dates. Please choose another room.');
  }

  // The database exclusion constraint in supabase/booking_safety.sql is the final
  // protection against two requests arriving at the exact same time.
  const { data, error } = await supabase
    .from('bookings')
    .insert([{
      guest_id: guestId,
      room_id: bookingData.roomId,
      check_in: bookingData.checkIn,
      check_out: bookingData.checkOut,
      total_amount: bookingData.totalAmount,
      payment_status: 'paid',
      status: 'confirmed'
    }]);

  if (error) throw new Error(error.message);
  return data;
};

export const registerCustomerAndBook = async (bookingData: any) => {
  const { error: signUpError } = await supabase.auth.signUp({
    email: bookingData.email,
    password: bookingData.password,
    options: {
      data: {
        full_name: bookingData.guestName,
        role: 'guest' // Explicitly locking them out of staff privileges
      }
    }
  });

  if (signUpError) throw new Error(signUpError.message);

  return createBooking({
    ...bookingData,
    paymentStatus: 'paid'
  });
};

export const getBookedRooms = async () => {
  const { data, error } = await supabase
    .from('rooms')
    .select(`
      *,
      bookings (
        id,
        check_in,
        check_out,
        status,
        total_amount,
        created_at,
        guests (full_name, email, phone)
      )
    `)
    .order('room_number', { ascending: true });

  if (error) throw new Error(error.message);

  return (data || [])
    .map((room: any) => ({
      ...room,
      bookings: (room.bookings || []).sort((a: any, b: any) =>
        new Date(b.created_at || b.check_in).getTime() - new Date(a.created_at || a.check_in).getTime()
      )
    }))
    .filter((room: any) => room.bookings.length > 0);
};

export const getDashboardStats = async () => {
  const { data, error } = await supabase
    .from('dashboard_stats')
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateRoomStatus = async (roomId: string, status: 'available' | 'occupied' | 'maintenance') => {
  const { data, error } = await supabase
    .from('rooms')
    .update({ status })
    .eq('id', roomId);

  if (error) throw new Error(error.message);
  return data;
};

export const updateBookingStatus = async (
  bookingId: string,
  status: 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled'
) => {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const checkInBooking = async (booking: any) => {
  const updatedBooking = await updateBookingStatus(booking.id, 'checked-in');

  if (booking.room_id) {
    await updateRoomStatus(booking.room_id, 'occupied');
  }

  return updatedBooking;
};

export const checkOutBooking = async (booking: any) => {
  const updatedBooking = await updateBookingStatus(booking.id, 'checked-out');

  if (booking.room_id) {
    await updateRoomStatus(booking.room_id, 'available');
  }

  return updatedBooking;
};

export const updateRoomPrice = async (roomId: string, newPrice: number) => {
  const { data, error } = await supabase
    .from('rooms')
    .update({ price_per_night: newPrice })
    .eq('id', roomId);

  if (error) throw new Error(error.message);
  return data;
};

// Add these to your existing apiData.ts

export const getMonthlyRevenue = async () => {
  const { data, error } = await supabase
    .from('monthly_revenue_stats')
    .select('*');
  if (error) throw new Error(error.message);
  return data;
};

// Simple fetch for all rooms to calculate occupancy on frontend
export const getAllRooms = async () => {
  const { data, error } = await supabase.from('rooms').select('*');
  if (error) throw new Error(error.message);
  return data;
};

export const getAllGuests = async () => {
  // We fetch guests AND their related bookings in one go
  const { data, error } = await supabase
    .from('guests')
    .select(`
      *,
      bookings (total_amount)
    `);

  if (error) throw new Error(error.message);

  // We calculate the totals before sending it to the component
  return data.map(guest => {
    const totalSpent = guest.bookings
      .reduce((sum: number, b: any) => sum + Number(b.total_amount), 0);
    
    const totalStays = guest.bookings.length;

    return {
      ...guest,
      total_spent: totalSpent,
      total_stays: totalStays
    };
  });
};

export const getTopCustomers = async () => {
  const { data, error } = await supabase
    .from('guests')
    .select(`
      full_name,
      bookings (total_amount)
    `);

  if (error) throw new Error(error.message);

  return data
    .map(guest => ({
      name: guest.full_name,
      spent: guest.bookings
        .reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0)
    }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5); // Take the top 5
};

export const createStaffAccount = async (email: string, fullName: string, role: 'receptionist' | 'manager') => {
  // Note: In a production app, you'd move this to a Supabase Edge Function 
  // so the 'service_role' key isn't exposed.
  const { data, error } = await supabase.auth.admin.createUser({
    email: email,
    password: 'TemporaryPassword123!', // They can change this later
    user_metadata: { full_name: fullName, role: role },
    email_confirm: true
  });

  if (error) throw new Error(error.message);
  return data;
};

export const createGuest = async (guestData: { full_name: string; email: string; phone?: string }) => {
  const { data, error } = await supabase
    .from('guests')
    .insert([guestData])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const createRoom = async (roomData: {
  room_number: string;
  type: string;
  floor: number;
  price_per_night: number;
  max_guests: number;
  description: string;
}) => {
  const { data, error } = await supabase
    .from('rooms')
    .insert([{
      ...roomData,
      status: 'available',
      amenities: [] // Default template placeholder array
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const getMyBookings = async (userEmail: string) => {
  const { data, error } = await supabase
    .from('bookings')
    // The !inner ensures we only get bookings matching this guest's email
    .select(`
      *,
      rooms (room_number, type, price_per_night),
      guests!inner (email, full_name, phone)
    `)
    .eq('guests.email', userEmail)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const cancelMyBooking = async (bookingId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    // Extra safety: only allow cancelling if it's currently pending or confirmed
    .in('status', ['pending', 'confirmed']) 
    .select();

  if (error) throw new Error(error.message);
  return data;
};
