import { useEffect, useState } from "react";
import { useLocation, Redirect } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface ProtectedDeveloperRouteProps {
  children: React.ReactNode;
}

export default function ProtectedDeveloperRoute({ children }: ProtectedDeveloperRouteProps) {
  const [location, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const response = await apiRequest("GET", "/api/developer/auth/me");
        const data = await response.json();

        if (data.success && data.user && data.user.role === 'developer') {
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(data.user));
          console.log('ProtectedDeveloperRoute: Authentication successful');
        } else {
          console.warn('ProtectedDeveloperRoute: Authentication failed - invalid response', data);
          setIsAuthenticated(false);
          localStorage.removeItem('user');
        }
      } catch (error: any) {
        console.error('ProtectedDeveloperRoute: Auth check error', {
          error: error?.message ?? error,
        });
        setIsAuthenticated(false);
        localStorage.removeItem('user');
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
    return <Redirect to={`/developer/login?redirect=${redirectTo}`} />;
  }

  return <>{children}</>;
}

