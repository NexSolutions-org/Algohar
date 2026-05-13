import { useLocation, Link } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  HeartHandshake,
  Settings,
  LogOut,
  Home,
  Shield,
  CreditCard,
} from "lucide-react";
import algoharLogo from "@assets/Screenshot_2025-09-08_142619-removebg-preview_1757368665353.png";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Donations",
    url: "/admin/donations",
    icon: HeartHandshake,
  },
  {
    title: "Payments",
    url: "/admin/payments",
    icon: CreditCard,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
];

function AdminSidebarContent() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { setOpenMobile, isMobile } = useSidebar();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Determine logout endpoint based on user role
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const isAdmin = user?.role === "admin";
      
      const endpoint = isAdmin ? "/api/admin/auth/logout" : "/api/auth/logout";
      const response = await apiRequest("POST", endpoint);
      return response.json();
    },
    onSuccess: () => {
      // Clear local storage
      localStorage.removeItem("user");
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      // Redirect to admin login page
      setLocation("/admin/login");
    },
    onError: (error: any) => {
      // Even if the API call fails, clear local storage and redirect
      localStorage.removeItem("user");
      
      toast({
        title: "Logged out",
        description: "You have been logged out.",
      });
      
      setLocation("/admin/login");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <Sidebar variant="inset" collapsible="offcanvas">
      <SidebarHeader>
        <div className="flex items-center gap-2.5 border-b border-sidebar-border px-3 py-4 sm:px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            <img
              src={algoharLogo}
              alt="Al Gohar Foundation"
              className="h-8 w-8 object-contain"
            />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-foreground truncate">
              Al Gohar Foundation
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1 truncate">
              <Shield className="h-3 w-3 shrink-0" />
              <span className="truncate">Admin Panel</span>
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location === item.url || location.startsWith(item.url + "/");

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link 
                        href={item.url}
                        onClick={() => {
                          if (isMobile) {
                            setOpenMobile(false);
                          }
                        }}
                      >
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Back to Home">
                  <Link 
                    href="/"
                    onClick={() => {
                      if (isMobile) {
                        setOpenMobile(false);
                      }
                    }}
                  >
                    <Home />
                    <span>Back to Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-2 pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2.5 border-b border-sidebar-border px-3 py-2.5 sm:px-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                <Shield className="h-4 w-4" />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium text-foreground truncate">
                  Admin User
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  admin@algohar.org
                </span>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Logout"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

// Export the content component for use in AdminLayout
export { AdminSidebarContent };

export default function AdminSidebar() {
  return (
    <SidebarProvider>
      <AdminSidebarContent />
    </SidebarProvider>
  );
}

