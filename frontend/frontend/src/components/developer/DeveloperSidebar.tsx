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
  Shield,
  LogOut,
  Home,
  Ban,
} from "lucide-react";
import algoharLogo from "@assets/Screenshot_2025-09-08_142619-removebg-preview_1757368665353.png";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  {
    title: "Domain Block",
    url: "/developer/domain-block",
    icon: Ban,
  },
];

function DeveloperSidebarContent() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { setOpenMobile, isMobile } = useSidebar();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/developer/auth/logout");
      return response.json();
    },
    onSuccess: () => {
      localStorage.removeItem("user");
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      setLocation("/developer/login");
    },
    onError: (error: any) => {
      localStorage.removeItem("user");
      
      toast({
        title: "Logged out",
        description: "You have been logged out.",
      });
      
      setLocation("/developer/login");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleNavClick = (url: string) => {
    setLocation(url);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <img
            src={algoharLogo}
            alt="Al Gohar Foundation"
            className="h-8 w-auto object-contain"
          />
          <div className="flex flex-col">
            <span className="text-xs font-semibold leading-tight">Developer Panel</span>
            <span className="text-[10px] text-muted-foreground leading-tight">Al Gohar Foundation</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
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
                      onClick={() => handleNavClick(item.url)}
                    >
                      <Link href={item.url}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <Home className="h-4 w-4" />
                <span>Back to Site</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default DeveloperSidebarContent;

