import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BedDouble, CalendarDays, CreditCard, Hotel, Mail, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAvailableRoomsForDates, registerCustomerAndBook } from "@/services/apiData";
import { formatCurrency } from "@/utils/currency";
import { supabase } from "@/lib/supabase";

const calculateNights = (checkIn: string, checkOut: string) => {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
  return days > 0 ? days : 0;
};

const getTodayDate = () => new Date().toISOString().split("T")[0];

const BookRoom = () => {
  const queryClient = useQueryClient();
  const today = getTodayDate();
  const [confirmedBooking, setConfirmedBooking] = useState(false);
  const [formData, setFormData] = useState({
    guestName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    roomId: "",
    checkIn: "",
    checkOut: "",
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: ""
  });

  useEffect(() => {
    const fetchUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Pre-fill the state so they don't have to type it again
        setFormData(current => ({
          ...current,
          email: session.user.email || "",
          guestName: session.user.user_metadata?.full_name || "",
        }));
      }
    };
    fetchUserSession();
  }, []);

  const { data: availableRooms = [], isLoading } = useQuery({
    queryKey: ["available-rooms", formData.checkIn, formData.checkOut],
    queryFn: () => getAvailableRoomsForDates(formData.checkIn, formData.checkOut)
  });

  const selectedRoom = availableRooms.find((room: any) => room.id === formData.roomId);
  const nights = calculateNights(formData.checkIn, formData.checkOut);
  const totalAmount = selectedRoom && nights > 0 ? nights * Number(selectedRoom.price_per_night) : 0;

  const maskedCard = useMemo(() => formData.cardNumber.replace(/\D/g, "").slice(0, 16), [formData.cardNumber]);

  const mutation = useMutation({
    mutationFn: registerCustomerAndBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["available-rooms"] });
      setConfirmedBooking(true);
      toast.success("Room booked successfully.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Unable to complete booking");
    }
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((current) => {
      const nextState = { ...current, [field]: value };

      if (field === "checkIn" && nextState.checkOut && nextState.checkOut <= value) {
        nextState.checkOut = "";
      }

      return nextState;
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.guestName || !formData.email || !formData.password || !formData.roomId || !formData.checkIn || !formData.checkOut) {
      toast.error("Please complete your account and booking details.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Password and confirm password must match.");
      return;
    }

    if (formData.checkIn < today || formData.checkOut < today) {
      toast.error("Bookings cannot be created for past dates.");
      return;
    }

    if (nights <= 0) {
      toast.error("Check-out date must be after check-in date.");
      return;
    }

    if (!selectedRoom) {
      toast.error("That room is unavailable for the selected dates. Please choose another room.");
      return;
    }

    if (maskedCard.length < 12 || !formData.expiry || !formData.cvv) {
      toast.error("Enter the simulated card details to complete payment.");
      return;
    }

    mutation.mutate({
      ...formData,
      cardNumber: maskedCard,
      totalAmount,
      paymentStatus: "paid"
    });
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Hotel className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold">Famous Haven</h1>
              <p className="text-xs text-muted-foreground">Book your stay</p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/login">Login</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1.25fr_0.75fr]">
        <form onSubmit={handleSubmit} className="stat-card space-y-6">
          <div>
            <h2 className="page-title">Reserve a Room</h2>
            <p className="mt-1 text-sm text-muted-foreground">Create your account, choose available dates, and complete your booking.</p>
          </div>

          {confirmedBooking ? (
            <div className="rounded-lg border border-success/30 bg-success/10 p-4 text-sm text-success">
              Your booking has been confirmed!!!
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="guestName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="guestName" className="pl-10" value={formData.guestName} onChange={(e) => handleChange("guestName", e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="email" className="pl-10" type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="phone" className="pl-10" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="+234..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <Input id="password" type="password" value={formData.password} onChange={(e) => handleChange("password", e.target.value)} required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 md:col-span-3">
              <Label>Available Room</Label>
              <Select value={formData.roomId} onValueChange={(value) => handleChange("roomId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoading ? "Loading rooms..." : "Select a room"} />
                </SelectTrigger>
                <SelectContent>
                  {availableRooms.map((room: any) => (
                    <SelectItem key={room.id} value={room.id}>
                      Room {room.room_number} - {room.type} ({formatCurrency(room.price_per_night)}/night)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkIn">Check-in</Label>
              <Input id="checkIn" type="date" min={today} value={formData.checkIn} onChange={(e) => handleChange("checkIn", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkOut">Check-out</Label>
              <Input id="checkOut" type="date" min={formData.checkIn || today} value={formData.checkOut} onChange={(e) => handleChange("checkOut", e.target.value)} required />
            </div>
            <div className="flex items-end">
              <div className="w-full rounded-lg border border-border bg-muted/40 p-3 text-sm">
                <p className="text-muted-foreground">Duration</p>
                <p className="font-semibold text-foreground">{nights} night{nights === 1 ? "" : "s"}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="cardName">Name on Card</Label>
              <Input id="cardName" value={formData.cardName} onChange={(e) => handleChange("cardName", e.target.value)} required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input id="cardNumber" inputMode="numeric" value={formData.cardNumber} onChange={(e) => handleChange("cardNumber", e.target.value)} placeholder="4242 4242 4242 4242" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry</Label>
              <Input id="expiry" placeholder="12/30" value={formData.expiry} onChange={(e) => handleChange("expiry", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input id="cvv" inputMode="numeric" value={formData.cvv} onChange={(e) => handleChange("cvv", e.target.value)} required />
            </div>
          </div>

          <Button type="submit" className="w-full gap-2" disabled={mutation.isPending || confirmedBooking}>
            <CreditCard className="h-4 w-4" />
            {mutation.isPending ? "Processing..." : `Book for ${formatCurrency(totalAmount)}`}
          </Button>
        </form>

        <aside className="space-y-6">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <BedDouble className="h-5 w-5 text-accent" />
              <h3 className="section-title mb-0">Booking Summary</h3>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Room</span>
                <span className="font-medium text-foreground">{selectedRoom ? `Room ${selectedRoom.room_number}` : "Not selected"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium capitalize text-foreground">{selectedRoom?.type || "N/A"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Rate</span>
                <span className="font-medium text-foreground">{selectedRoom ? `${formatCurrency(selectedRoom.price_per_night)} / night` : "N/A"}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-accent" />
              <h3 className="section-title mb-0">Available Rooms</h3>
            </div>
            <div className="mt-4 space-y-3">
              {availableRooms.slice(0, 4).map((room: any) => (
                <button
                  type="button"
                  key={room.id}
                  onClick={() => handleChange("roomId", room.id)}
                  className="flex w-full items-center justify-between rounded-lg border border-border p-3 text-left transition hover:bg-muted/50"
                >
                  <span>
                    <span className="block font-medium">Room {room.room_number}</span>
                    <span className="text-xs capitalize text-muted-foreground">{room.type}</span>
                  </span>
                  <span className="text-sm font-semibold">{formatCurrency(room.price_per_night)}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
};

export default BookRoom;
