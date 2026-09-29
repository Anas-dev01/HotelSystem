import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getDashboardStats, getTopCustomers, getAllRooms } from "@/services/apiData"; // Updated import
import { supabase } from "@/lib/supabase";
import { DashboardLayout } from "@/components/DashboardLayout";
import { formatCurrency } from "@/utils/currency";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ['hsl(38, 70%, 55%)', 'hsl(220, 30%, 22%)', 'hsl(142, 60%, 40%)', 'hsl(210, 80%, 52%)', 'hsl(0, 72%, 51%)'];

const Analytics = () => {
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats
  });

  // 2. Fetch Top Customers instead of monthly revenue
  const { data: topCustomers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['top-customers'],
    queryFn: getTopCustomers
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: getAllRooms
  });

  const roomTypeRevenue = rooms.reduce((acc: any[], room: any) => {
    const existing = acc.find(item => item.type === room.type);
    if (existing) {
      existing.revenue += Number(room.price_per_night) || 0;
    } else {
      acc.push({ type: room.type, revenue: Number(room.price_per_night) || 0 });
    }
    return acc;
  }, []);

  const occupancyData = [
    { day: 'Mon', rate: 72 }, { day: 'Tue', rate: 68 }, { day: 'Wed', rate: 75 },
    { day: 'Thu', rate: 82 }, { day: 'Fri', rate: 91 }, { day: 'Sat', rate: 95 }, { day: 'Sun', rate: 88 }
  ];

  useEffect(() => {
    const channel = supabase
      .channel('realtime-analytics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['top-customers'] });
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(channel); 
    };
  }, [queryClient]);

  if (statsLoading || customersLoading) {
    return (
      <DashboardLayout>
        {/* Header Block Placeholder */}
        <div className="page-header space-y-2 mb-6">
          <div className="h-7 w-40 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
        </div>

        {/* 3 Metrics Counter Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[1, 2, 3].map((card) => (
            <div key={card} className="stat-card p-6 space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-muted/80 rounded animate-pulse" />
                <div className="w-8 h-8 rounded-lg bg-muted/60 animate-pulse" />
              </div>
              <div className="h-8 w-20 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Main Workspace Split: Chart Grid & Leaderboard List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Big Chart Shimmer Box Container */}
          <div className="stat-card p-6 lg:col-span-2 space-y-4">
            <div className="h-5 w-36 bg-muted rounded animate-pulse" />
            {/* Simulating Chart bars fading out */}
            <div className="h-[300px] w-full bg-muted/40 rounded flex items-end gap-4 p-4">
              <div className="w-full h-1/3 bg-muted/50 rounded animate-pulse" />
              <div className="w-full h-2/3 bg-muted/50 rounded animate-pulse" />
              <div className="w-full h-1/2 bg-muted/50 rounded animate-pulse" />
              <div className="w-full h-5/6 bg-muted/50 rounded animate-pulse" />
              <div className="w-full h-3/4 bg-muted/50 rounded animate-pulse" />
            </div>
          </div>

          {/* Right Sidebar Leaderboard Placeholder */}
          <div className="stat-card p-6 space-y-4">
            <div className="h-5 w-40 bg-muted rounded animate-pulse" />
            <div className="space-y-4 pt-2">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex justify-between items-center pb-3 border-b border-border/40 last:border-0 last:pb-0">
                  <div className="space-y-2">
                    <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-16 bg-muted/60 rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-12 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Revenue, occupancy, and booking insights</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card text-center">
          <p className="text-3xl font-bold font-heading text-foreground">
            ₦{((stats?.total_revenue || 0) / 1000).toFixed(1)}k
          </p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Total Revenue</p>
        </div>
        
        <div className="stat-card text-center">
          <p className="text-3xl font-bold font-heading text-foreground">{stats?.total_confirmed_bookings || 0}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Confirmed Bookings</p>
        </div>

        <div className="stat-card text-center">
          <p className="text-3xl font-bold font-heading text-foreground">{stats?.current_occupancy_rate || 0}%</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Occupancy Rate</p>
        </div>

        <div className="stat-card text-center">
          <p className="text-3xl font-bold font-heading text-foreground">{stats?.total_guests || 0}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Total Guests</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* REPLACED: TOP 5 CUSTOMERS CHART */}
        <div className="stat-card">
          <h3 className="section-title">Top 5 Customers (By Spending)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topCustomers} layout="vertical" margin={{ left: 40, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(40, 15%, 89%)" />
              <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} hide />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fontWeight: 500 }} width={100} />
              <Tooltip formatter={(v) => formatCurrency(v as number)} />
              <Bar dataKey="spent" fill="hsl(38, 70%, 55%)" radius={[0, 4, 4, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="stat-card">
          <h3 className="section-title">Revenue by Room Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={roomTypeRevenue} 
                dataKey="revenue" 
                nameKey="type" 
                cx="50%" cy="50%" 
                outerRadius={100} 
                label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
              >
                {roomTypeRevenue.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="stat-card">
        <h3 className="section-title">Weekly Occupancy Rate</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={occupancyData}>
            <defs>
              <linearGradient id="occGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(220, 30%, 22%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(220, 30%, 22%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 15%, 89%)" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(value: number) => [`${value}%`, 'Occupancy']} />
            <Area type="monotone" dataKey="rate" stroke="hsl(220, 30%, 22%)" fill="url(#occGradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
