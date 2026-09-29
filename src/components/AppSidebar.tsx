import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck,
  ClipboardList,
  Users,
  BarChart3,
  Hotel,
  ShieldCheck,
  LogOut, // Added for logout button
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { logout } from "@/services/authService";
import { supabase } from "@/lib/supabase";

const handleLogout = async () => {
  await logout();
  window.location.href = "/login";
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  // Optimized Role Fetching using useQuery
  const { data: profile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      return data;
    }
  });

  const isManager = profile?.role === 'manager';

  // Base items that both Receptionists and Managers can see
  const mainItems = [
    { title: "Bookings", url: "/bookings", icon: CalendarCheck },
    { title: "Booked Rooms", url: "/booked-rooms", icon: ClipboardList },
    { title: "Rooms", url: "/rooms", icon: BedDouble },
    { title: "Guests", url: "/guests", icon: Users },
  ];

  // If the user is a Manager, inject administrative dashboards to the START of the list
  if (isManager) {
    mainItems.unshift(
      { title: "Dashboard", url: "/", icon: LayoutDashboard }
    );
    mainItems.push(
      { title: "Analytics", url: "/analytics", icon: BarChart3 },
      { title: "Staff Management", url: "/staff", icon: ShieldCheck }
    );
  }

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
            <Hotel className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-sm font-semibold text-sidebar-accent-foreground">
                Famous Haven
              </h1>
              <p className="text-xs text-sidebar-foreground">Hotel Management</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {!collapsed && <span className="font-medium">Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        {!collapsed && (
          <div className="text-[10px] text-sidebar-foreground/30 text-center mt-2 uppercase tracking-widest">
            © 2026 Famous Haven
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
