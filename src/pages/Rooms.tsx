import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { RoomStatus } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, BedDouble, Banknote, Users as UsersIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRooms, updateRoomStatus, createRoom } from "@/services/apiData";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/currency";

const Rooms = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  // Dialog visibility state controls
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State Layout definitions
  const [formData, setFormData] = useState({
    room_number: "",
    floor: "",
    type: "",
    price_per_night: "",
    max_guests: "",
    description: ""
  });

  // Query database entries
  const { data: rooms, isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: getRooms
  });

  // ADD THIS LINE: Read cached user profile role directly
  const { data: profile } = useQuery<any>({ queryKey: ['user-profile'] });
  const isManager = profile?.role === 'manager';

  // Maintenance Status Update Mutation Logic
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: any }) => updateRoomStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success("Room status updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update status");
    }
  });

  // Insert Room Mutation Configuration
  const addRoomMutation = useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success("Room created and added successfully!");
      setIsDialogOpen(false); // Close dialog cleanly
      setFormData({ room_number: "", floor: "", type: "", price_per_night: "", max_guests: "", description: "" }); // Clear cache inputs
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create new room database record.");
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Core data type presence checks
    if (!formData.room_number || !formData.floor || !formData.type || !formData.price_per_night || !formData.max_guests) {
      toast.error("Please fill in all strictly required parameters.");
      return;
    }

    setIsSubmitting(true);
    
    addRoomMutation.mutate({
      room_number: formData.room_number,
      type: formData.type,
      floor: parseInt(formData.floor, 10),
      price_per_night: parseFloat(formData.price_per_night),
      max_guests: parseInt(formData.max_guests, 10),
      description: formData.description
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="page-header space-y-2 mb-6">
          <div className="h-7 w-28 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
        </div>

        {/* Grid matching your 3-column room layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((card) => (
            <div key={card} className="stat-card p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="h-5 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-6 w-20 bg-muted/80 rounded-full animate-pulse" />
              </div>
              <div className="h-12 w-full bg-muted/50 rounded animate-pulse" />
              <div className="space-y-2 pt-2">
                <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  const filteredRooms = (rooms || []).filter((room) => {
    const matchesSearch = room.room_number.includes(searchQuery) || room.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || room.type === filterType;
    const matchesStatus = filterStatus === "all" || room.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const statusCounts = {
    available: rooms?.filter(r => r.status === 'available').length || 0,
    occupied: rooms?.filter(r => r.status === 'occupied').length || 0,
    reserved: rooms?.filter(r => r.status === 'reserved').length || 0,
    maintenance: rooms?.filter(r => r.status === 'maintenance').length || 0,
  };

  return (
    <DashboardLayout>
      <div className="page-header flex justify-between items-end mb-6">
        <div>
          <h1 className="page-title">Rooms</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your hotel rooms and availability</p>
        </div>
        
        {/* UPDATED: Only managers can view or open the Add Room workspace modal */}
        {isManager && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 flex gap-2">
                <Plus className="w-4 h-4" /> Add Room
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle className="font-heading text-lg font-bold">Add New Room</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="room_num">Room Number <span className="text-destructive">*</span></Label>
                    <Input id="room_num" required placeholder="e.g. 101" value={formData.room_number} onChange={(e) => setFormData({...formData, room_number: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="floor">Floor <span className="text-destructive">*</span></Label>
                    <Input id="floor" type="number" required placeholder="e.g. 1" value={formData.floor} onChange={(e) => setFormData({...formData, floor: e.target.value})} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Room Type <span className="text-destructive">*</span></Label>
                    <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="double">Double</SelectItem>
                        <SelectItem value="suite">Suite</SelectItem>
                        <SelectItem value="deluxe">Deluxe</SelectItem>
                        <SelectItem value="penthouse">Penthouse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="price">Price / Night (₦) <span className="text-destructive">*</span></Label>
                    <Input id="price" type="number" required placeholder="e.g. 149" value={formData.price_per_night} onChange={(e) => setFormData({...formData, price_per_night: e.target.value})} />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="guests">Max Guests <span className="text-destructive">*</span></Label>
                  <Input id="guests" type="number" required placeholder="e.g. 2" value={formData.max_guests} onChange={(e) => setFormData({...formData, max_guests: e.target.value})} />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="desc">Description</Label>
                  <Input id="desc" placeholder="Room layout overview description..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>

                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    {isSubmitting ? "Processing..." : "Create Room"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="stat-card flex items-center gap-3">
            <StatusBadge status={status as RoomStatus} />
            <span className="text-lg font-semibold text-foreground">{count}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search rooms..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="single">Single</SelectItem>
            <SelectItem value="double">Double</SelectItem>
            <SelectItem value="suite">Suite</SelectItem>
            <SelectItem value="deluxe">Deluxe</SelectItem>
            <SelectItem value="penthouse">Penthouse</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="occupied">Occupied</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Room grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <div key={room.id} className="stat-card group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Room {room.room_number}</h3>
                <p className="text-sm text-muted-foreground capitalize">{room.type}</p>
              </div>
              <StatusBadge status={room.status} />
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">{room.description}</p>
            
            {/* UPDATED: Vertical stacked layout for better scannability */}
            <div className="flex flex-col gap-2.5 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-accent" /> 
                <span className="font-medium text-foreground">{formatCurrency(room.price_per_night)}</span> / night
              </span>
              <span className="flex items-center gap-2">
                <UsersIcon className="w-4 h-4 text-muted-foreground" /> 
                Maximum <span className="font-medium text-foreground">{room.max_guests}</span> guests
              </span>
              <span className="flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-muted-foreground" /> 
                Located on <span className="font-medium text-foreground">Floor {room.floor}</span>
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {(room.amenities || []).slice(0, 3).map((a: string) => (
                <span key={a} className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">{a}</span>
              ))}
              {room.amenities?.length > 3 && (
                <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">+{room.amenities.length - 3}</span>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => statusMutation.mutate({ id: room.id, status: 'maintenance' })}
                className="text-orange-600 w-full"
                disabled={room.status === 'maintenance'}
              >
                Mark for Maintenance
              </Button>
              {room.status === 'maintenance' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => statusMutation.mutate({ id: room.id, status: 'available' })}
                  className="text-green-600 w-full"
                >
                  Mark Available
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Rooms;
