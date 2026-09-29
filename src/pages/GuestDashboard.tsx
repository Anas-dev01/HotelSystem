import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { getMyBookings, cancelMyBooking } from "@/services/apiData";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Hotel, LogOut, XCircle } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/currency";

const GuestDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // 1. Verify Authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      } else {
        setUserEmail(session.user.email || null);
      }
    };
    checkAuth();
  }, [navigate]);

  // 2. Fetch User's Data
  const { data: myBookings = [], isLoading } = useQuery({
    queryKey: ['my-bookings', userEmail],
    queryFn: () => getMyBookings(userEmail!),
    enabled: !!userEmail, // Only run query once we have the email
  });

  // 3. Handle Cancellations
  const cancelMutation = useMutation({
    mutationFn: cancelMyBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      toast.success("Booking cancelled successfully.");
    },
    onError: (error: any) => toast.error(error.message)
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (isLoading || !userEmail) return <div className="p-10 text-center animate-pulse">Loading portal...</div>;

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-4 flex justify-between items-center max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <Hotel className="text-primary w-6 h-6" />
          <h1 className="font-semibold text-lg">Famous Haven Portal</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive">
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </header>

      <section className="max-w-5xl mx-auto py-8 px-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-heading">My Reservations</h2>
          <p className="text-muted-foreground mt-1 text-sm">Manage your upcoming and past stays.</p>
        </div>

        {myBookings.length === 0 ? (
          <div className="stat-card text-center py-12">
            <p className="text-muted-foreground mb-4">You have no booking history.</p>
            <Button onClick={() => navigate("/book-room")}>Book a Room</Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {myBookings.map((booking: any) => (
              <div key={booking.id} className="stat-card flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-lg text-foreground">Room {booking.rooms?.room_number}</span>
                    <StatusBadge status={booking.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Check-in: <span className="text-foreground">{booking.check_in}</span> | 
                    Check-out: <span className="text-foreground">{booking.check_out}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total: <span className="font-medium text-foreground">{formatCurrency(booking.total_amount)}</span>
                  </p>
                </div>

                <div className="flex gap-3">
                  {/* {(booking.status === 'pending' || booking.status === 'confirmed') && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => cancelMutation.mutate(booking.id)}
                      disabled={cancelMutation.isPending}
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Cancel Stay
                    </Button>
                  )} */}
                  <Button variant="outline" size="sm" onClick={() => navigate("/book-room")}>
                    Book Again
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default GuestDashboard;