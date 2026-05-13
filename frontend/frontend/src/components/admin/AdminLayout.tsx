import { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebarContent } from "./Sidebar";
import AdminTopbar from "./Topbar";
import { useAdminSEOTitle } from "@/hooks/useSEOTitle";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  // Set SEO title based on current route
  useAdminSEOTitle();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebarContent />
        <SidebarInset>
          <div className="flex flex-1 flex-col">
            <AdminTopbar />
            <main className="flex flex-1 flex-col gap-4 px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 pt-2 md:pt-4 overflow-x-hidden">
              {children}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

