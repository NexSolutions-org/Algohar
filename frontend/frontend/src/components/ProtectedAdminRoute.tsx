import { useEffect, useState } from "react";
import { useLocation, Redirect } from "wouter";
import { apiRequest, API_BASE_URL } from "@/lib/queryClient";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const [location, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async (retryCount = 0) => {
      setIsLoading(true);
      try {
        const response = await apiRequest("GET", "/api/admin/auth/me");
        const data = await response.json();

        if (data.success && data.user && data.user.role === 'admin') {
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(data.user));
          console.log('ProtectedAdminRoute: Authentication successful');
        } else {
          console.warn('ProtectedAdminRoute: Authentication failed - invalid response', data);
          setIsAuthenticated(false);
          localStorage.removeItem('user');
        }
      } catch (error: any) {
        console.error('ProtectedAdminRoute: Auth check error', {
          error: error?.message ?? error,
          retryCount,
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
    return <Redirect to={`/admin/login?redirect=${redirectTo}`} />;
  }

  return <>{children}</>;
}

