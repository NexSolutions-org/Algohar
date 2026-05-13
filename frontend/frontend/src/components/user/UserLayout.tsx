import { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { UserSidebarContent } from "./Sidebar";
import UserTopbar from "./Topbar";
import { useUserSEOTitle } from "@/hooks/useSEOTitle";

interface UserLayoutProps {
  children: ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  // Set SEO title based on current route
  useUserSEOTitle();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <UserSidebarContent />
        <SidebarInset>
          <div className="flex flex-1 flex-col">
            <UserTopbar />
            <main className="flex flex-1 flex-col gap-4 px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 pt-2 md:pt-4 overflow-x-hidden">
              {children}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

