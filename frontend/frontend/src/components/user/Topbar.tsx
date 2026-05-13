import { useLocation, Link } from "wouter";
import { useState, useEffect } from "react";
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
import {
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import CurrencySelector from "@/components/CurrencySelector";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Map routes to page titles
const pageTitles: Record<string, string> = {
  "/user/dashboard": "Dashboard",
  "/user/donate-now": "Donate Now",
  "/user/my-donations": "My Donations",
  "/user/payments": "Payments",
  "/user/settings": "Settings",
};

export default function UserTopbar() {
  const [location, setLocation] = useLocation();
  const [userData, setUserData] = useState<{ name?: string; email?: string; avatar?: string } | null>(null);
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout");
      return response.json();
    },
    onSuccess: () => {
      localStorage.removeItem("user");
      // notify other tabs/components
      window.dispatchEvent(new Event('userDataUpdated'));
      toast({ title: 'Logged out', description: 'You have been logged out.' });
      setLocation('/login');
    },
    onError: () => {
      localStorage.removeItem("user");
      window.dispatchEvent(new Event('userDataUpdated'));
      toast({ title: 'Logged out', description: 'You have been logged out.' });
      setLocation('/login');
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
            avatar: user.avatar || undefined,
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

  // Get page title from current route
  const getPageTitle = () => {
    for (const [path, title] of Object.entries(pageTitles)) {
      if (location === path || location.startsWith(path + "/")) {
        return title;
      }
    }
    return "Dashboard";
  };

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
        <h1 className="text-base md:text-lg font-semibold text-foreground truncate">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-1 md:gap-2 ml-auto shrink-0">
        {/* Currency Selector - Hidden on very small screens */}
        <div className="hidden sm:flex">
          <CurrencySelector compact={true} />
        </div>
        
        <Separator orientation="vertical" className="h-4 md:h-6 hidden sm:block" />
        
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 w-8 md:h-10 md:w-10 rounded-full"
              aria-label="User menu"
            >
              <Avatar className="h-8 w-8 md:h-10 md:w-10">
                <AvatarImage src={userData?.avatar} alt={userData?.name || "User"} />
                <AvatarFallback>
                  {userData?.name ? (
                    userData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userData?.name || "User Name"}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userData?.email || "user@example.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/user/settings" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/user/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
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

