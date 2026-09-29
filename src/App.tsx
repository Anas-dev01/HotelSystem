import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { supabase } from "@/lib/supabase";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import BookRoom from "./pages/BookRoom";
import Index from "./pages/Index.tsx";
import Rooms from "./pages/Rooms.tsx";
import BookedRooms from "./pages/BookedRooms.tsx";
import Bookings from "./pages/Bookings.tsx";
import Guests from "./pages/Guests.tsx";
import Analytics from "./pages/Analytics.tsx";
import Staff from "./pages/Staff.tsx";
import RegisterStaff from "./pages/RegisterStaff.tsx";
import NotFound from "./pages/NotFound.tsx";
import GuestDashboard from "./pages/GuestDashboard.tsx";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
        queryClient.invalidateQueries({ queryKey: ['booked-rooms'] });
        queryClient.invalidateQueries({ queryKey: ['monthly-revenue'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
        queryClient.invalidateQueries({ queryKey: ['rooms'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/book-room" element={<BookRoom />} />
            <Route path="/login" element={<Login />} />
            <Route path="/my-bookings" element={<GuestDashboard />} />
            
            {/* Wrap all administrative routes */}
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/rooms" element={<ProtectedRoute><Rooms /></ProtectedRoute>} />
            <Route path="/booked-rooms" element={<ProtectedRoute><BookedRooms /></ProtectedRoute>} />
            <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
            <Route path="/guests" element={<ProtectedRoute><Guests /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/staff" element={<ProtectedRoute><Staff /></ProtectedRoute>} />
            <Route path="/register-staff" element={<ProtectedRoute><RegisterStaff /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
