import { useLocation, Link } from "wouter";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Settings,
  LogOut,
  LayoutDashboard,
  Home,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Map routes to page titles
const pageTitles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/users": "Users Management",
  "/admin/donations": "Donations Management",
  "/admin/projects": "Projects Management",
  "/admin/blogs": "Blogs Management",
  "/admin/reports": "Reports & Analytics",
  "/admin/payments": "Payments",
  "/admin/media": "Media Library",
  "/admin/messages": "Messages",
  "/admin/settings": "Settings",
};

export default function AdminTopbar() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Get page title from current route
  const getPageTitle = () => {
    for (const [path, title] of Object.entries(pageTitles)) {
      if (location === path || location.startsWith(path + "/")) {
        return title;
      }
    }
    return "Admin Dashboard";
  };

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
    <header className="sticky top-0 z-40 flex h-14 md:h-16 shrink-0 items-center gap-1.5 md:gap-2 border-b bg-background px-2 sm:px-4">
      {/* Sidebar Toggle */}
      <SidebarTrigger className="-ml-1 h-8 w-8 md:h-9 md:w-9" />

      <Separator orientation="vertical" className="mr-1 md:mr-2 h-4 md:h-6 hidden sm:block" />

      {/* Page Title */}
      <div className="flex flex-1 items-center gap-2 md:gap-4 min-w-0">
        <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
          <h1 className="text-base md:text-lg font-semibold text-foreground truncate">
            {getPageTitle()}
          </h1>
          <Badge variant="secondary" className="hidden md:flex items-center gap-1 shrink-0">
            <Shield className="h-3 w-3" />
            Admin
          </Badge>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-1 md:gap-2 ml-auto shrink-0">
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 w-8 md:h-10 md:w-10 rounded-full"
              aria-label="Admin menu"
            >
              <Avatar className="h-8 w-8 md:h-10 md:w-10 border-2 border-primary/20">
                <AvatarImage src="" alt="Admin" />
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Shield className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium leading-none">Admin User</p>
                  <Badge variant="secondary" className="h-4 px-1.5 text-xs">
                    <Shield className="h-2.5 w-2.5 mr-1" />
                    Admin
                  </Badge>
                </div>
                <p className="text-xs leading-none text-muted-foreground">
                  admin@algohar.org
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/dashboard" className="cursor-pointer">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/" className="cursor-pointer">
                <Home className="mr-2 h-4 w-4" />
                <span>Back to Home</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

