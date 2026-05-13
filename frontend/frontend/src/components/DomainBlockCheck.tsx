import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

export default function DomainBlockCheck({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isBlocked, setIsBlocked] = useState<boolean | null>(null);
  const [blockedHtml, setBlockedHtml] = useState<string | null>(null);

  useEffect(() => {
    // Skip check for developer and admin routes
    if (
      location.startsWith("/developer") ||
      location.startsWith("/admin") ||
      location.startsWith("/user")
    ) {
      setIsBlocked(false);
      return;
    }

    // Check domain block status
    const checkDomainBlock = async () => {
      try {
        const response = await apiRequest("GET", "/api/domain-block-status");
        const data = await response.json();

        if (data.success && data.is_enabled) {
          setIsBlocked(true);
          setBlockedHtml(data.html_content);
        } else {
          setIsBlocked(false);
        }
      } catch (error) {
        // If check fails, assume not blocked
        setIsBlocked(false);
      }
    };

    checkDomainBlock();
  }, [location]);

  // Show loading state while checking
  if (isBlocked === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // If blocked, show the HTML content
  if (isBlocked && blockedHtml) {
    return <div dangerouslySetInnerHTML={{ __html: blockedHtml }} />;
  }

  // Otherwise, show the normal app
  return <>{children}</>;
}

