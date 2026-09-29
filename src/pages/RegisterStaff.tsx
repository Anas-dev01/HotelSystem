import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardLayout } from "@/components/DashboardLayout";
import { toast } from "sonner";

const RegisterStaff = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "receptionist"
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          role: formData.role,
        },
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Staff created! You will now be logged in as the new user.");
      window.location.href = "/"; // Refresh to clear manager state
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto mt-10 stat-card">
        <h2 className="text-xl font-bold mb-4">Register New Staff</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Note: After creating this account, the system will switch to the new user session.
        </p>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input required onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" required onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
            <Label>Temporary Password</Label>
            <Input type="password" required onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>
          <div>
            <Label>Assign Role</Label>
            <Select onValueChange={(v) => setFormData({...formData, role: v})}>
              <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="receptionist">Receptionist</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Registering..." : "Create Account"}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default RegisterStaff;