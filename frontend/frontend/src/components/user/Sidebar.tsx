import { useLocation, Link } from "wouter";
import { useState, useEffect } from "react";
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
  Heart,
  History,
  CreditCard,
  Settings,
  LogOut,
  User,
  Home,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import algoharLogo from "@assets/Screenshot_2025-09-08_142619-removebg-preview_1757368665353.png";

const menuItems = [
  {
    title: "Dashboard",
    url: "/user/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Donate Now",
    url: "/user/donate-now",
    icon: Heart,
  },
  {
    title: "My Donations",
    url: "/user/my-donations",
    icon: History,
  },
  {
    title: "Payments",
    url: "/user/payments",
    icon: CreditCard,
  },
  {
    title: "Settings",
    url: "/user/settings",
    icon: Settings,
  },
];

function UserSidebarContent() {
  const [location] = useLocation();
  const [userData, setUserData] = useState<{ name?: string; email?: string } | null>(null);
  const { setOpenMobile, isMobile } = useSidebar();
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/auth/logout');
      return response.json();
    },
    onSuccess: () => {
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('userDataUpdated'));
      toast({ title: 'Logged out', description: 'You have been logged out.' });
      window.location.href = '/login';
    },
    onError: () => {
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('userDataUpdated'));
      toast({ title: 'Logged out', description: 'You have been logged out.' });
      window.location.href = '/login';
    }
  });

  // Load user data from localStorage
  useEffect(() => {
    const loadUserData = () => {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          setUserData({
            name: user.name || "User",
            email: user.email || "user@example.com",
          });
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        setUserData(null);
      }
    };

    // Load initially
    loadUserData();

    // Listen for storage changes (cross-tab updates)
    window.addEventListener("storage", loadUserData);
    
    // Listen for custom event (same-tab updates)
    const handleUserDataUpdate = () => loadUserData();
    window.addEventListener("userDataUpdated", handleUserDataUpdate);
    
    // Reload on focus (in case data was updated in another tab)
    window.addEventListener("focus", loadUserData);

    return () => {
      window.removeEventListener("storage", loadUserData);
      window.removeEventListener("userDataUpdated", handleUserDataUpdate);
      window.removeEventListener("focus", loadUserData);
    };
  }, []);

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
            <span className="text-xs text-muted-foreground truncate">
              User Panel
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.url || location.startsWith(item.url + "/");
                
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
                <SidebarMenuButton
                  asChild
                  tooltip="Back to Home"
                >
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
                <User className="h-4 w-4" />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium text-foreground truncate">
                  {userData?.name || "User Name"}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {userData?.email || "user@example.com"}
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

// Export the content component for use in UserLayout
export { UserSidebarContent };

export default function UserSidebar() {
  return (
    <SidebarProvider>
      <UserSidebarContent />
    </SidebarProvider>
  );
}

