import { useEffect, useState } from "react";
import { useLocation, Redirect } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface ProtectedUserRouteProps {
  children: React.ReactNode;
}

export default function ProtectedUserRoute({ children }: ProtectedUserRouteProps) {
  const [location, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiRequest("GET", "/api/auth/me");
        const data = await response.json();
        
        if (data.success && data.user) {
          // Ensure user is not an admin trying to access user routes
          if (data.user.role === "admin") {
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
          }
          
          setIsAuthenticated(true);
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem("user");
        }
      } catch (error) {
        setIsAuthenticated(false);
        localStorage.removeItem("user");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [location]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirectTo = encodeURIComponent(location);
    return <Redirect to={`/login?redirect=${redirectTo}`} />;
  }

  return <>{children}</>;
}

