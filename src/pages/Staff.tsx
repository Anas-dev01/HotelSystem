import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { UserPlus, ShieldCheck, Shield, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Staff = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch the currently logged-in user so we know who is browsing the page
  const { data: currentUser } = useQuery({
    queryKey: ['current-auth-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  // Fetch all profiles (Managers & Receptionists)
  const { data: staff = [], isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('role', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  // Profile Deletion Mutation
  const deleteStaffMutation = useMutation({
    mutationFn: async (staffId: string) => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', staffId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success("Staff profile removed successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete staff profile.");
    }
  });

  const handleDelete = (id: string, name: string) => {
    // SECURITY GUARD: Check if the user is trying to delete themselves
    if (currentUser && currentUser.id === id) {
      toast.error("Security Restriction: You cannot delete your own administrative account.");
      return;
    }

    if (window.confirm(`Are you absolutely sure you want to remove ${name} from the system?`)) {
      deleteStaffMutation.mutate(id);
    }
  };

  // Modern Animated Skeleton Loading State Override
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="page-header flex justify-between items-end">
          <div className="space-y-2">
            <div className="h-7 w-44 bg-muted rounded animate-pulse" />
            <div className="h-4 w-64 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-10 w-36 bg-muted rounded animate-pulse" />
        </div>

        <div className="stat-card mt-6 p-6 space-y-4">
          <div className="flex justify-between border-b border-border pb-3">
            {["Name", "Role", "Status", "Actions"].map((h) => (
              <div key={h} className="h-4 w-16 bg-muted/70 rounded animate-pulse" />
            ))}
          </div>
          {[1, 2, 3].map((row) => (
            <div key={row} className="flex justify-between items-center py-2 border-b border-border/40 last:border-0">
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-4 w-12 bg-muted rounded animate-pulse" />
              <div className="h-8 w-8 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-header flex justify-between items-end">
        <div>
          <h1 className="page-title">Staff Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage system access and employee roles</p>
        </div>
        <Button onClick={() => navigate("/register-staff")} className="flex gap-2">
          <UserPlus className="w-4 h-4" /> Add New Staff
        </Button>
      </div>

      <div className="stat-card mt-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Name</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Role</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member: any) => (
                <tr key={member.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-medium">{member.full_name}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {member.role === 'manager' ? (
                        <ShieldCheck className="w-4 h-4 text-accent" />
                      ) : (
                        <Shield className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="capitalize">{member.role}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Active</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(member.id, member.full_name)}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive p-2"
                      disabled={currentUser?.id === member.id}
                      title={currentUser?.id === member.id ? "You cannot delete yourself" : "Delete Staff Member"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Staff;