export type RoomType = 'single' | 'double' | 'suite' | 'deluxe' | 'penthouse';
export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'reserved';
export type BookingStatus = 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled' | 'pending';
export type PaymentStatus = 'paid' | 'pending' | 'refunded' | 'partial';

export interface Room {
  id: string;
  number: string;
  type: RoomType;
  floor: number;
  price: number;
  status: RoomStatus;
  amenities: string[];
  maxGuests: number;
  description: string;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalStays: number;
  totalSpent: number;
  lastVisit: string;
  vipStatus: boolean;
}

export interface Booking {
  id: string;
  guestId: string;
  guestName: string;
  roomId: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export const rooms: Room[] = [
  { id: '1', number: '101', type: 'single', floor: 1, price: 89, status: 'available', amenities: ['Wi-Fi', 'TV', 'Mini Bar'], maxGuests: 1, description: 'Cozy single room with city view' },
  { id: '2', number: '102', type: 'single', floor: 1, price: 89, status: 'occupied', amenities: ['Wi-Fi', 'TV', 'Mini Bar'], maxGuests: 1, description: 'Comfortable single room' },
  { id: '3', number: '201', type: 'double', floor: 2, price: 149, status: 'available', amenities: ['Wi-Fi', 'TV', 'Mini Bar', 'Balcony'], maxGuests: 2, description: 'Spacious double room with balcony' },
  { id: '4', number: '202', type: 'double', floor: 2, price: 149, status: 'reserved', amenities: ['Wi-Fi', 'TV', 'Mini Bar', 'Balcony'], maxGuests: 2, description: 'Double room overlooking the garden' },
  { id: '5', number: '301', type: 'suite', floor: 3, price: 299, status: 'occupied', amenities: ['Wi-Fi', 'TV', 'Mini Bar', 'Jacuzzi', 'Living Area'], maxGuests: 3, description: 'Luxurious suite with jacuzzi' },
  { id: '6', number: '302', type: 'suite', floor: 3, price: 299, status: 'available', amenities: ['Wi-Fi', 'TV', 'Mini Bar', 'Jacuzzi', 'Living Area'], maxGuests: 3, description: 'Premium suite with panoramic views' },
  { id: '7', number: '401', type: 'deluxe', floor: 4, price: 199, status: 'maintenance', amenities: ['Wi-Fi', 'TV', 'Mini Bar', 'Work Desk', 'Coffee Machine'], maxGuests: 2, description: 'Deluxe room with work area' },
  { id: '8', number: '402', type: 'deluxe', floor: 4, price: 199, status: 'available', amenities: ['Wi-Fi', 'TV', 'Mini Bar', 'Work Desk', 'Coffee Machine'], maxGuests: 2, description: 'Deluxe room with skyline view' },
  { id: '9', number: '501', type: 'penthouse', floor: 5, price: 599, status: 'available', amenities: ['Wi-Fi', 'TV', 'Mini Bar', 'Jacuzzi', 'Private Terrace', 'Butler Service'], maxGuests: 4, description: 'The Grand Penthouse' },
  { id: '10', number: '103', type: 'single', floor: 1, price: 89, status: 'occupied', amenities: ['Wi-Fi', 'TV'], maxGuests: 1, description: 'Economy single room' },
];

export const guests: Guest[] = [
  { id: '1', name: 'James Whitmore', email: 'james@email.com', phone: '+1 555-0101', totalStays: 12, totalSpent: 8540, lastVisit: '2024-10-15', vipStatus: true },
  { id: '2', name: 'Sarah Chen', email: 'sarah.chen@email.com', phone: '+1 555-0102', totalStays: 5, totalSpent: 3200, lastVisit: '2024-10-20', vipStatus: false },
  { id: '3', name: 'Marcus Rivera', email: 'marcus.r@email.com', phone: '+1 555-0103', totalStays: 8, totalSpent: 6100, lastVisit: '2024-10-18', vipStatus: true },
  { id: '4', name: 'Emily Watson', email: 'emily.w@email.com', phone: '+1 555-0104', totalStays: 2, totalSpent: 890, lastVisit: '2024-10-22', vipStatus: false },
  { id: '5', name: 'David Park', email: 'david.park@email.com', phone: '+1 555-0105', totalStays: 15, totalSpent: 12300, lastVisit: '2024-10-10', vipStatus: true },
  { id: '6', name: 'Olivia Laurent', email: 'olivia.l@email.com', phone: '+1 555-0106', totalStays: 3, totalSpent: 1800, lastVisit: '2024-10-25', vipStatus: false },
];

export const bookings: Booking[] = [
  { id: 'B001', guestId: '1', guestName: 'James Whitmore', roomId: '2', roomNumber: '102', checkIn: '2024-10-20', checkOut: '2024-10-24', status: 'checked-in', totalAmount: 356, paymentStatus: 'paid', createdAt: '2024-10-15' },
  { id: 'B002', guestId: '2', guestName: 'Sarah Chen', roomId: '5', roomNumber: '301', checkIn: '2024-10-21', checkOut: '2024-10-25', status: 'checked-in', totalAmount: 1196, paymentStatus: 'paid', createdAt: '2024-10-16' },
  { id: 'B003', guestId: '3', guestName: 'Marcus Rivera', roomId: '4', roomNumber: '202', checkIn: '2024-10-26', checkOut: '2024-10-28', status: 'confirmed', totalAmount: 298, paymentStatus: 'paid', createdAt: '2024-10-18' },
  { id: 'B004', guestId: '4', guestName: 'Emily Watson', roomId: '1', roomNumber: '101', checkIn: '2024-10-27', checkOut: '2024-10-29', status: 'pending', totalAmount: 178, paymentStatus: 'pending', createdAt: '2024-10-22' },
  { id: 'B005', guestId: '5', guestName: 'David Park', roomId: '9', roomNumber: '501', checkIn: '2024-10-28', checkOut: '2024-11-02', status: 'confirmed', totalAmount: 2995, paymentStatus: 'partial', createdAt: '2024-10-20' },
  { id: 'B006', guestId: '6', guestName: 'Olivia Laurent', roomId: '3', roomNumber: '201', checkIn: '2024-10-22', checkOut: '2024-10-23', status: 'checked-out', totalAmount: 149, paymentStatus: 'paid', createdAt: '2024-10-19' },
  { id: 'B007', guestId: '1', guestName: 'James Whitmore', roomId: '10', roomNumber: '103', checkIn: '2024-10-19', checkOut: '2024-10-21', status: 'checked-in', totalAmount: 178, paymentStatus: 'paid', createdAt: '2024-10-14' },
  { id: 'B008', guestId: '3', guestName: 'Marcus Rivera', roomId: '6', roomNumber: '302', checkIn: '2024-11-01', checkOut: '2024-11-05', status: 'confirmed', totalAmount: 1196, paymentStatus: 'pending', createdAt: '2024-10-25' },
];

export const revenueData = [
  { month: 'Jan', revenue: 28400, bookings: 45 },
  { month: 'Feb', revenue: 31200, bookings: 52 },
  { month: 'Mar', revenue: 35600, bookings: 58 },
  { month: 'Apr', revenue: 33800, bookings: 55 },
  { month: 'May', revenue: 41200, bookings: 67 },
  { month: 'Jun', revenue: 48500, bookings: 78 },
  { month: 'Jul', revenue: 52300, bookings: 85 },
  { month: 'Aug', revenue: 49800, bookings: 81 },
  { month: 'Sep', revenue: 43200, bookings: 70 },
  { month: 'Oct', revenue: 45800, bookings: 74 },
];

export const occupancyData = [
  { day: 'Mon', rate: 72 },
  { day: 'Tue', rate: 68 },
  { day: 'Wed', rate: 75 },
  { day: 'Thu', rate: 82 },
  { day: 'Fri', rate: 91 },
  { day: 'Sat', rate: 95 },
  { day: 'Sun', rate: 88 },
];

export const roomTypeRevenue = [
  { type: 'Single', revenue: 8900, color: 'hsl(38, 70%, 55%)' },
  { type: 'Double', revenue: 14900, color: 'hsl(220, 30%, 22%)' },
  { type: 'Suite', revenue: 29900, color: 'hsl(142, 60%, 40%)' },
  { type: 'Deluxe', revenue: 19900, color: 'hsl(210, 80%, 52%)' },
  { type: 'Penthouse', revenue: 59900, color: 'hsl(0, 72%, 51%)' },
];
