import { ReactNode } from "react";
import { useLocation } from "wouter";
import Header from "./Header";
import Footer from "./Footer";
import DonationModal from "./DonationModal";
import WhatsAppButton from "./WhatsAppButton";
import PageTransition from "./PageTransition";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  
  // Hide header and footer for user and admin dashboard pages
  const isUserRoute = location.startsWith("/user/");
  const isAdminRoute = location.startsWith("/admin/");
  const shouldShowHeaderFooter = !isUserRoute && !isAdminRoute;
  
  return (
    <div className="min-h-screen bg-background">
      {shouldShowHeaderFooter && <Header />}
      <main>
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      {shouldShowHeaderFooter && <Footer />}
      {shouldShowHeaderFooter && <WhatsAppButton />}
      <DonationModal />
    </div>
  );
}
