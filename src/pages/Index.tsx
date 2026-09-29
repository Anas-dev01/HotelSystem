import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { getAllRooms, getBookings, getMonthlyRevenue, getAllGuests } from "@/services/apiData";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { BedDouble, CalendarCheck, Banknote, Users } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area 
} from "recharts";

const Index = () => {
  // Extract user authorization state from the global cache wrapper
  const { data: profile, isLoading: isProfileLoading } = useQuery<any>({ 
    queryKey: ['user-profile'] 
  });

  const { data: rooms = [] } = useQuery({ queryKey: ['rooms'], queryFn: getAllRooms });
  const { data: bookings = [] } = useQuery({ queryKey: ['bookings'], queryFn: getBookings });
  const { data: revenueData = [] } = useQuery({ queryKey: ['monthly-revenue'], queryFn: getMonthlyRevenue });
  const { data: guests = [] } = useQuery({ queryKey: ['guests'], queryFn: getAllGuests });

  // Don't route choices prematurely while waiting on the network fetch
  if (isProfileLoading) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-4 z-50">
        {/* Animated Core Ring Spinner */}
        <div className="w-10 h-10 border-4 border-muted border-t-accent rounded-full animate-spin" />
        
        {/* Pulsing Security Message */}
        <p className="text-sm font-medium text-muted-foreground animate-pulse tracking-wide">
          Verifying authorization clearance...
        </p>
      </div>
    );
  }

  // FORCE REDIRECT: Kick them out to Bookings if they are a receptionist
  if (profile?.role === 'receptionist') {
    return <Navigate to="/bookings" replace />;
  }

  // Occupancy is based on stays that include today, not a manually-set room status.
  const todayStr = new Date().toISOString().split('T')[0];
  const operationalRooms = rooms.filter((room: any) => room.status !== 'maintenance');
  const occupiedRoomIds = new Set(
    bookings
      .filter((booking: any) =>
        ['confirmed', 'checked-in'].includes(booking.status) &&
        booking.check_in <= todayStr && booking.check_out > todayStr
      )
      .map((booking: any) => booking.room_id)
  );
  const occupancyRate = operationalRooms.length > 0
    ? Math.round((operationalRooms.filter((room: any) => occupiedRoomIds.has(room.id)).length / operationalRooms.length) * 100)
    : 0;

  // REAL revenue today
  const todayRevenue = bookings
    .filter(b => (b.check_in === todayStr || b.checkIn === todayStr))
    .reduce((acc, b) => acc + (Number(b.total_amount) || Number(b.totalAmount) || 0), 0);

  const activeBookings = bookings.filter(b => b.status === 'checked-in' || b.status === 'confirmed').length;
  const upcomingBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');

  // GENERATE REAL WEEKLY OCCUPANCY DATA
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyOccupancy = days.map((day, index) => {
    const dayBookings = bookings.filter(b => {
      const date = new Date(b.check_in || b.checkIn);
      return date.getDay() === index;
    }).length;
    const rate = operationalRooms.length > 0 ? Math.min(100, Math.round((dayBookings / operationalRooms.length) * 100)) : 0;
    return { day, rate };
  });

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        {/* <p className="text-sm text-muted-foreground">Welcome back</p> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Occupancy" value={`${occupancyRate}%`} changeType="positive" icon={BedDouble} />
        <StatCard title="Revenue Today" value={formatCurrency(todayRevenue)} changeType="positive" icon={Banknote} />
        <StatCard title="Active Bookings" value={String(activeBookings)} change={`${upcomingBookings.length} upcoming`} changeType="neutral" icon={CalendarCheck} />
        <StatCard title="Total Guests" value={String(guests.length)} change={`+${guests.length} total`} changeType="positive" icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="stat-card">
          <h3 className="section-title">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(38, 70%, 55%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(38, 70%, 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220, 15%, 92%)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(220, 10%, 46%)' }} dy={10} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: 'hsl(220, 10%, 46%)' }} 
                tickFormatter={(v) => v >= 1000 ? `₦${(v / 1000).toFixed(1)}k` : formatCurrency(v)} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value: number) => [formatCurrency(value), 'Revenue']} 
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(38, 70%, 55%)" fill="url(#revenueGradient)" strokeWidth={3} dot={{ r: 4, fill: 'hsl(38, 70%, 55%)', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="stat-card">
          <h3 className="section-title">Weekly Occupancy</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyOccupancy} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220, 15%, 92%)" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(220, 10%, 46%)' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(220, 10%, 46%)' }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip 
                cursor={{ fill: 'hsl(220, 15%, 96%)' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value: number) => [`${value}%`, 'Occupancy']} 
              />
              <Bar dataKey="rate" fill="hsl(220, 30%, 22%)" radius={[6, 6, 0, 0]} barSize={35} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="stat-card">
        <h3 className="section-title">Upcoming Bookings</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Guest</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Room</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Check-in</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Check-out</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 5).map((booking) => (
                <tr key={booking.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-medium text-foreground">{booking.guests?.full_name || booking.guestName}</td>
                  <td className="py-3 px-4 text-muted-foreground">Room {booking.rooms?.room_number || booking.roomNumber}</td>
                  <td className="py-3 px-4 text-muted-foreground">{booking.check_in || booking.checkIn}</td>
                  <td className="py-3 px-4 text-muted-foreground">{booking.check_out || booking.checkOut}</td>
                  <td className="py-3 px-4"><StatusBadge status={booking.status} /></td>
                  <td className="py-3 px-4 font-medium text-foreground">{formatCurrency(booking.total_amount || booking.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
