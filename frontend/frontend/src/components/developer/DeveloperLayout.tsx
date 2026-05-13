import { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import DeveloperSidebarContent from "./DeveloperSidebar";
import DeveloperTopbar from "./DeveloperTopbar";

interface DeveloperLayoutProps {
  children: ReactNode;
}

export default function DeveloperLayout({ children }: DeveloperLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <DeveloperSidebarContent />
        <SidebarInset>
          <div className="flex flex-1 flex-col">
            <DeveloperTopbar />
            <main className="flex flex-1 flex-col gap-4 px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 pt-2 md:pt-4 overflow-x-hidden">
              {children}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

