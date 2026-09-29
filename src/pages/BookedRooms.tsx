import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BedDouble, CalendarCheck, Mail, Phone, Search, Users } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBookedRooms } from "@/services/apiData";
import { formatCurrency } from "@/utils/currency";

const BookedRooms = () => {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: rooms = [], isLoading, error } = useQuery({
    queryKey: ["booked-rooms"],
    queryFn: getBookedRooms
  });

  const filteredRooms = rooms.filter((room: any) => {
    const query = searchQuery.toLowerCase();
    return (
      room.room_number?.toLowerCase().includes(query) ||
      room.type?.toLowerCase().includes(query) ||
      room.bookings?.some((booking: any) => booking.guests?.full_name?.toLowerCase().includes(query))
    );
  });

  const selectedRoom = useMemo(() => {
    if (!filteredRooms.length) return null;
    return filteredRooms.find((room: any) => room.id === selectedRoomId) || filteredRooms[0];
  }, [filteredRooms, selectedRoomId]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="page-header space-y-2 mb-6">
          <div className="h-7 w-40 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="stat-card h-96 animate-pulse bg-muted/40" />
          <div className="stat-card h-96 animate-pulse bg-muted/40" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-destructive">Unable to load booked rooms.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Booked Rooms</h1>
          <p className="text-sm text-muted-foreground mt-1">Select a booked room to view the customers attached to it</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="stat-card flex items-center gap-3">
          <BedDouble className="h-5 w-5 text-accent" />
          <div>
            <p className="text-2xl font-bold font-heading">{rooms.length}</p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Booked Rooms</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <CalendarCheck className="h-5 w-5 text-accent" />
          <div>
            <p className="text-2xl font-bold font-heading">
              {rooms.reduce((sum: number, room: any) => sum + room.bookings.length, 0)}
            </p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Bookings</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <Users className="h-5 w-5 text-accent" />
          <div>
            <p className="text-2xl font-bold font-heading">
              {new Set(rooms.flatMap((room: any) => room.bookings.map((booking: any) => booking.guests?.email).filter(Boolean))).size}
            </p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Customers</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="stat-card">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search room or customer..."
              className="pl-9"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <div className="space-y-3">
            {filteredRooms.length ? filteredRooms.map((room: any) => (
              <Button
                key={room.id}
                type="button"
                variant={selectedRoom?.id === room.id ? "default" : "outline"}
                className="h-auto w-full justify-between p-4 text-left"
                onClick={() => setSelectedRoomId(room.id)}
              >
                <span>
                  <span className="block font-semibold">Room {room.room_number}</span>
                  <span className="block text-xs capitalize opacity-80">{room.type}</span>
                </span>
                <span className="text-sm">{room.bookings.length} booking{room.bookings.length === 1 ? "" : "s"}</span>
              </Button>
            )) : (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No booked rooms match your search.
              </div>
            )}
          </div>
        </section>

        <section className="stat-card">
          {selectedRoom ? (
            <>
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="section-title mb-1">Room {selectedRoom.room_number}</h2>
                  <p className="text-sm capitalize text-muted-foreground">
                    {selectedRoom.type} room on floor {selectedRoom.floor || "N/A"}
                  </p>
                </div>
                <div className="rounded-lg bg-muted px-3 py-2 text-sm font-semibold">
                  {formatCurrency(selectedRoom.price_per_night)} / night
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Dates</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRoom.bookings.map((booking: any) => (
                      <tr key={booking.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-4">
                          <p className="font-medium text-foreground">{booking.guests?.full_name || "Unknown guest"}</p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {booking.guests?.email || "No email"}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {booking.guests?.phone || "No phone"}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">
                          <span className="block">{booking.check_in}</span>
                          <span className="block">{booking.check_out}</span>
                        </td>
                        <td className="px-4 py-4"><StatusBadge status={booking.status} /></td>
                        <td className="px-4 py-4 text-right font-semibold">{formatCurrency(booking.total_amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No rooms have bookings yet.
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default BookedRooms;
