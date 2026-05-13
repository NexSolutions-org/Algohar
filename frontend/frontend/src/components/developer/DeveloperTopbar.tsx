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
  Home,
  Code,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Map routes to page titles
const pageTitles: Record<string, string> = {
  "/developer/domain-block": "Domain Block Management",
};

export default function DeveloperTopbar() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Get page title from current route
  const getPageTitle = () => {
    for (const [path, title] of Object.entries(pageTitles)) {
      if (location === path || location.startsWith(path + "/")) {
        return title;
      }
    }
    return "Developer Panel";
  };

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

  // Get user info from localStorage
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

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
            <Code className="h-3 w-3" />
            Developer
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
              aria-label="Developer menu"
            >
              <Avatar className="h-8 w-8 md:h-10 md:w-10 border-2 border-primary/20">
                <AvatarImage src="" alt="Developer" />
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Code className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium leading-none">Developer User</p>
                  <Badge variant="secondary" className="h-4 px-1.5 text-xs">
                    <Code className="h-2.5 w-2.5 mr-1" />
                    Developer
                  </Badge>
                </div>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || "admin@codeans.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
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

