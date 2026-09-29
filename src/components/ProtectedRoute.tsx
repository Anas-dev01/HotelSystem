import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      // Fetch the role from our profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      setRole(profile?.role || 'receptionist');

      // SECURITY BLOCK: If receptionist tries to enter /analytics
      if (profile?.role === 'receptionist' && location.pathname === '/analytics') {
        navigate("/"); // Kick them back to dashboard
      }

      setLoading(false);
    };

    checkUser();
  }, [navigate, location]);

  if (loading) return <div>Authenticating...</div>;

  return <>{children}</>;
};