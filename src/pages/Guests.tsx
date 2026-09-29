import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllGuests, createGuest } from "@/services/apiData";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Search, Crown, Mail, Phone, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/currency";

const Guests = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: ""
  });

  // Fetch real data from Supabase
  const { data: guests = [], isLoading } = useQuery<any[]>({
    queryKey: ['guests'],
    queryFn: getAllGuests
  });

  // Insertion Mutation
  const addGuestMutation = useMutation({
    mutationFn: createGuest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      toast.success("Guest profile created successfully!");
      setIsDialogOpen(false);
      setFormData({ full_name: "", email: "", phone: "" }); // Reset Form
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create guest profile.");
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name.trim() || !formData.email.trim()) {
      toast.error("Full Name and Email are strictly required.");
      return;
    }
    setIsSubmitting(true);
    addGuestMutation.mutate(formData);
  };

  // Filter logic updated for Supabase field 'full_name'
  const filteredGuests = guests.filter(g =>
    (g.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="page-header space-y-2 mb-6">
          <div className="h-7 w-24 bg-muted rounded animate-pulse" />
          <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((profile) => (
            <div key={profile} className="stat-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                {/* Avatar circle skeleton placeholder */}
                <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-36 bg-muted/70 rounded animate-pulse" />
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="h-3 w-full bg-muted/40 rounded animate-pulse" />
                <div className="h-3 w-5/6 bg-muted/40 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-header flex justify-between items-end mb-6">
        <div>
          <h1 className="page-title">Guests</h1>
          <p className="text-sm text-muted-foreground mt-1">Guest profiles and booking history</p>
        </div>

        {/* Add Guest Dialog Popup */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex gap-2">
              <UserPlus className="w-4 h-4" /> Add Guest
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Register New Guest</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="full_name">Full Name <span className="text-destructive">*</span></Label>
                <Input 
                  id="full_name" 
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="e.g. Salam Jamiu" 
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                <Input 
                  id="email" 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="e.g. jamiu@example.com" 
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone">Phone Number <span className="text-muted-foreground">(Optional)</span></Label>
                <Input 
                  id="phone" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="e.g. +234..." 
                />
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Profile"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search guests..." 
          className="pl-9" 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGuests.map((guest) => (
          <div key={guest.id} className="stat-card">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                  {(guest.full_name || "G").split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground flex items-center gap-1.5">
                    {guest.full_name}
                    {guest.vip_status && <Crown className="w-3.5 h-3.5 text-accent" />}
                  </h3>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground mb-4">
              <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" />{guest.email}</p>
              <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{guest.phone || "N/A"}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border text-center">
              <div>
                <p className="text-lg font-semibold text-foreground">{guest.total_stays || 0}</p>
                <p className="text-xs text-muted-foreground">Stays</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(guest.total_spent || 0)}
                </p>
                <p className="text-xs text-muted-foreground">Spent</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {guest.created_at ? new Date(guest.created_at).toLocaleDateString() : "N/A"}
                </p>
                <p className="text-xs text-muted-foreground">Joined</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Guests;
