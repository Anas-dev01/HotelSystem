import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBookings, getRooms, createBooking, getAllGuests, checkInBooking, checkOutBooking } from "@/services/apiData";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, FileText, LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";
import { generateReceipt } from "@/utils/generateReceipt";
import { formatCurrency } from "@/utils/currency";

const calculateNights = (checkIn: string, checkOut: string): number => {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const differenceInTime = end.getTime() - start.getTime();
  const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
  return differenceInDays > 0 ? differenceInDays : 0;
};

const getTodayDate = () => new Date().toISOString().split("T")[0];

const Bookings = () => {
  const queryClient = useQueryClient();
  const today = getTodayDate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  // Form State
  const [formData, setFormData] = useState({
    isNewGuest: true,
    guestId: '',
    guestName: '',
    email: '',
    phone: '',
    roomId: '',
    checkIn: '',
    checkOut: '',
    totalAmount: 0,
  });

  // Controlled helper to dynamic calc total amounts
  const updateBookingData = (updatedFields: Partial<typeof formData>) => {
    const nextFormState = { ...formData, ...updatedFields };

    if (updatedFields.checkIn && nextFormState.checkOut && nextFormState.checkOut <= updatedFields.checkIn) {
      nextFormState.checkOut = '';
    }

    const selectedRoom = rooms.find((r: any) => r.id === nextFormState.roomId);
    
    if (selectedRoom && nextFormState.checkIn && nextFormState.checkOut) {
      const nights = calculateNights(nextFormState.checkIn, nextFormState.checkOut);
      nextFormState.totalAmount = nights * selectedRoom.price_per_night;
    } else if (selectedRoom) {
      nextFormState.totalAmount = selectedRoom.price_per_night; // Fallback default
    } else {
      nextFormState.totalAmount = 0;
    }

    setFormData(nextFormState);
  };

  // Fetch Bookings from Supabase
  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ['bookings'],
    queryFn: getBookings
  });

  // Fetch Rooms for the "New Booking" dropdown
  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: getRooms
  });

  // Fetch Guests for existing guest selection
  const { data: guests = [] } = useQuery({
    queryKey: ['guests'],
    queryFn: getAllGuests
  });

  // Create Booking Mutation
  const mutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      toast.success("Booking created successfully!");
      setFormData({ 
        isNewGuest: true, 
        guestId: '', 
        guestName: '', 
        email: '', 
        phone: '', 
        roomId: '', 
        checkIn: '', 
        checkOut: '', 
        totalAmount: 0,
      });
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const checkInMutation = useMutation({
    mutationFn: checkInBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booked-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success("Booking checked in successfully.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Unable to check in booking.");
    }
  });

  const checkOutMutation = useMutation({
    mutationFn: checkOutBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booked-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success("Booking checked out successfully.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Unable to check out booking.");
    }
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="page-header flex justify-between items-end mb-6">
          <div className="space-y-2">
            <div className="h-7 w-32 bg-muted rounded animate-pulse" />
            <div className="h-4 w-56 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-muted rounded animate-pulse" />
        </div>

        {/* Shimmering Filter Bar Placeholder */}
        <div className="h-10 w-full max-w-md bg-muted rounded mb-6 animate-pulse" />

        {/* Mock Data Skeleton Table Grid */}
        <div className="stat-card space-y-4 p-6">
          <div className="flex justify-between border-b border-border pb-3">
            {["ID", "Guest", "Room", "Check-In", "Check-Out", "Amount"].map((h) => (
              <div key={h} className="h-4 w-16 bg-muted/70 rounded animate-pulse" />
            ))}
          </div>
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="flex justify-between items-center py-2 border-b border-border/40 last:border-0">
              <div className="h-4 w-12 bg-muted rounded animate-pulse" />
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-4 w-10 bg-muted rounded animate-pulse" />
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-4 w-12 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </DashboardLayout>
    );
  }
  if (error) return <DashboardLayout><div className="text-destructive">Error loading bookings.</div></DashboardLayout>;

  const filteredBookings = bookings.filter((b: any) => {
    const guestName = b.guests?.full_name || "";
    const matchesSearch = 
      guestName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || b.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage reservations and check-ins</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-2" /> New Booking
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-lg overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">Create New Booking</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="flex gap-4 mb-4">
                <Button 
                  type="button" 
                  variant={formData.isNewGuest ? "default" : "outline"} 
                  onClick={() => setFormData({...formData, isNewGuest: true, guestId: ''})}
                >New Guest</Button>
                <Button 
                  type="button" 
                  variant={!formData.isNewGuest ? "default" : "outline"} 
                  onClick={() => setFormData({...formData, isNewGuest: false})}
                >Existing Guest</Button>
              </div>

              {!formData.isNewGuest ? (
                <div>
                  <Label>Select Existing Guest</Label>
                  <Select onValueChange={(id) => {
                    const g = guests.find((guest: any) => guest.id === id);
                    if (g) updateBookingData({ guestId: id, guestName: g.full_name, email: g.email, phone: g.phone || '' });
                  }}>
                    <SelectTrigger><SelectValue placeholder="Search guests..." /></SelectTrigger>
                    <SelectContent>
                      {guests.map((g: any) => (
                        <SelectItem key={g.id} value={g.id}>{g.full_name} ({g.email})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <>
                  <div>
                    <Label>Full Name</Label>
                    <Input 
                      placeholder="Full name"
                      value={formData.guestName} 
                      onChange={(e) => setFormData({...formData, guestName: e.target.value})} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Email</Label>
                      <Input 
                        type="email" 
                        placeholder="guest@email.com"
                        value={formData.email} 
                        onChange={(e) => setFormData({...formData, email: e.target.value})} 
                      />
                    </div>
                    <div>
                      <Label>Phone Number</Label>
                      <Input 
                        placeholder="+234..."
                        value={formData.phone} 
                        onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <Label>Room</Label>
                <Select 
                  onValueChange={(roomId) => {
                    updateBookingData({ roomId });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms
                      .filter((r: any) => r.status === 'available')
                      .filter((room: any) => !formData.checkIn || !formData.checkOut || !bookings.some((booking: any) =>
                        booking.room_id === room.id &&
                        !['cancelled', 'checked-out'].includes(booking.status) &&
                        formData.checkIn < booking.check_out && formData.checkOut > booking.check_in
                      ))
                      .map((r: any) => (
                        <SelectItem key={r.id} value={r.id}>
                          Room {r.room_number} — {r.type} ({formatCurrency(r.price_per_night)}/night)
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Check-in</Label>
                  <Input 
                    type="date" 
                    min={today}
                    value={formData.checkIn}
                    onChange={(e) => updateBookingData({ checkIn: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Check-out</Label>
                  <Input 
                    type="date" 
                    min={formData.checkIn || today}
                    value={formData.checkOut}
                    onChange={(e) => updateBookingData({ checkOut: e.target.value })}
                  />
                </div>
              </div>

              {formData.roomId && formData.checkIn && formData.checkOut && (
                <div className="bg-muted/50 p-3 rounded-lg border border-border space-y-1 text-sm mb-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Rate:</span>
                    <span>{formatCurrency(rooms.find((r: any) => r.id === formData.roomId)?.price_per_night)} / night</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Duration:</span>
                    <span>{calculateNights(formData.checkIn, formData.checkOut)} nights</span>
                  </div>
                  <div className="flex justify-between font-semibold text-foreground border-t border-dashed border-border pt-1.5 mt-1.5">
                    <span>Estimated Total:</span>
                    <span>{formatCurrency(formData.totalAmount)}</span>
                  </div>
                </div>
              )}

              <Button 
                className="w-full"
                onClick={() => {
                  if (!formData.guestId && (!formData.guestName || !formData.email)) {
                    toast.error("Please enter guest details or select an existing guest.");
                    return;
                  }

                  if (!formData.roomId || !formData.checkIn || !formData.checkOut) {
                    toast.error("Please select a room and booking dates.");
                    return;
                  }

                  if (formData.checkIn < today || formData.checkOut < today) {
                    toast.error("Bookings cannot be created for past dates.");
                    return;
                  }

                  if (calculateNights(formData.checkIn, formData.checkOut) <= 0) {
                    toast.error("Check-out date must be after check-in date.");
                    return;
                  }

                  mutation.mutate(formData);
                }}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Saving..." : "Confirm Booking"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-foreground font-heading">{bookings.filter((b: any) => b.status === 'pending').length}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Pending</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-foreground font-heading">{bookings.filter((b: any) => b.status === 'confirmed').length}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Confirmed</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-foreground font-heading">{bookings.filter((b: any) => b.status === 'checked-in').length}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Checked In</p>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by guest or booking ID..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="checked-in">Checked In</SelectItem>
            <SelectItem value="checked-out">Checked Out</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bookings Table */}
      <div className="stat-card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Guest</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Room</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Check-in</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Check-out</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking: any) => (
              <tr key={booking.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="py-3 px-4 text-sm font-mono text-muted-foreground">{booking.id.slice(0, 8)}</td>
                <td className="py-3 px-4 font-medium text-foreground">{booking.guests?.full_name}</td>
                <td className="py-3 px-4 text-muted-foreground">{booking.rooms?.room_number}</td>
                <td className="py-3 px-4 text-muted-foreground">{booking.check_in}</td>
                <td className="py-3 px-4 text-muted-foreground">{booking.check_out}</td>
                <td className="py-3 px-4"><StatusBadge status={booking.status} /></td>
                <td className="py-3 px-4 font-medium text-foreground">{formatCurrency(booking.total_amount)}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-1">
                    {booking.status === 'confirmed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => checkInMutation.mutate(booking)}
                        className="text-success hover:text-success"
                        disabled={checkInMutation.isPending || checkOutMutation.isPending}
                        title="Check in"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    {booking.status === 'checked-in' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => checkOutMutation.mutate(booking)}
                        className="text-info hover:text-info"
                        disabled={checkInMutation.isPending || checkOutMutation.isPending}
                        title="Check out"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => generateReceipt(booking)}
                      className="text-accent hover:text-accent/80 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Receipt
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default Bookings;
