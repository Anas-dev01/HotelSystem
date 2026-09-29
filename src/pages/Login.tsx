import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "@/services/authService";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, Mail } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw new Error(authError.message);

      if (authData.user) {
        // Fetch the role from the profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single();

        // Smart Routing
        if (profile?.role === 'manager' || profile?.role === 'receptionist') {
          window.location.href = "/"; // Send staff to Admin Dashboard
        } else {
          window.location.href = "/my-bookings"; // Send guests to Customer Portal
        }
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto bg-accent w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <Lock className="text-accent-foreground w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-heading">Famous Haven</CardTitle>
          <CardDescription>
            Enter your credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@hotel.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button 
            type="submit"
            className="w-full flex items-center justify-center gap-2" 
            disabled={isLoading}
          >
            {isLoading ? (
            <div className="flex items-center justify-center gap-2.5 w-full">
              {/* Clean, high-contrast spinning ring */}
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              
              {/* Pulsing state narrative */}
              <span className="font-medium animate-pulse tracking-wide text-primary-foreground/90">
                Authenticating clearance...
              </span>
            </div>
          ) : (
            "Login to Dashboard"
          )}
          </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Customer?{" "}
            <Link to="/book-room" className="font-medium text-accent hover:underline">
              Sign up and book a room
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;