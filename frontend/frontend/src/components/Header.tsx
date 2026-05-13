import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, ChevronDown } from "lucide-react";
import algoharLogo from "@assets/Screenshot_2025-09-08_142619-removebg-preview_1757368665353.png";
import CurrencySelector from "@/components/CurrencySelector";


const servicesDropdown = [
  { name: "All Services", href: "/services" },
  { name: "Free Education", href: "/free-education" },
];

const pagesDropdown = [
  { name: "About Us", href: "/about" },
  { name: "Contact Us", href: "/contact" },
];

const navigation = [
  { name: "Qurbani 2026", href: "/donate/qurbani" },
  { name: "Projects", href: "/projects" },
  { name: "Reports", href: "/reports" },
  { name: "Bank Details", href: "/bank-details" },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [location] = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const userStr = localStorage.getItem("user");
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setIsLoggedIn(true);
          setUserRole(user.role || null);
        } catch {
          setIsLoggedIn(false);
          setUserRole(null);
        }
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    };

    checkAuth();
    // Check auth on storage changes (e.g., when user logs in/out in another tab)
    window.addEventListener("storage", checkAuth);
    
    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, [location]); // Re-check auth when location changes

  const getDashboardLink = () => {
    if (userRole === "admin") {
      return "/admin/dashboard";
    }
    return "/user/dashboard";
  };

  return (
    <header className="sticky top-0 bg-white shadow-md z-50 border-b border-border">
      <div className="container mx-auto px-2 py-2">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3" data-testid="link-home">
            <div className="w-12 h-12 flex items-center justify-center">
              <img 
                src={algoharLogo} 
                alt="Algohar Educational & Welfare Society Logo" 
                className="w-12 h-12 object-contain"
              />
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-foreground leading-tight">ALGOHAR</h1>
              <p className="text-sm text-muted-foreground leading-tight">Educational & Welfare Society</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {/* Services Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="text-foreground hover:text-primary transition-colors p-0 h-auto font-normal"
                  data-testid="dropdown-services"
                >
                  Services <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {servicesDropdown.map((item) => (
                  <DropdownMenuItem key={item.name} asChild>
                    <Link 
                      href={item.href}
                      className="w-full cursor-pointer"
                      data-testid={`link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Other Navigation Items */}
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors"
                data-testid={`link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {item.name}
              </Link>
            ))}

            {/* Pages Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-foreground hover:text-primary transition-colors p-0 h-auto font-normal"
                >
                  Pages <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                {pagesDropdown.map((item) => (
                  <DropdownMenuItem key={item.name} asChild>
                    <Link
                      href={item.href}
                      className="w-full cursor-pointer"
                      data-testid={`link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <div className="flex items-center space-x-2">
            {/* Currency Selector - Desktop */}
            <div className="hidden lg:flex">
              <CurrencySelector compact={true} />
            </div>
            
            {isLoggedIn ? (
              <Link href={getDashboardLink()}>
                <Button 
                  variant="outline"
                  className="hidden md:flex px-4 py-2 rounded-lg font-semibold text-sm"
                  data-testid="button-dashboard-header"
                >
                  DASHBOARD
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button 
                  variant="outline"
                  className="hidden md:flex px-4 py-2 rounded-lg font-semibold text-sm"
                  data-testid="button-login-header"
                >
                  LOGIN
                </Button>
              </Link>
            )}
            
            <Link href="/donate">
              <Button 
                className="btn-primary px-3 sm:px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl text-xs sm:text-sm"
                data-testid="button-donate-header"
              >
                <span className="hidden sm:inline">DONATE NOW</span>
                <span className="sm:hidden">DONATE</span>
              </Button>
            </Link>
            
            {/* Mobile menu button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="lg:hidden"
                  data-testid="button-mobile-menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px] p-0">
                <div className="flex flex-col h-full">
                  {/* Mobile Menu Header with Logo */}
                  <div className="flex items-center gap-3 px-6 py-5 border-b bg-gradient-to-r from-primary/5 to-primary/10">
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10">
                      <img 
                        src={algoharLogo} 
                        alt="Algohar Logo" 
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <div className="flex flex-col">
                      <h2 className="text-lg font-bold text-foreground leading-tight">ALGOHAR</h2>
                      <p className="text-xs text-muted-foreground leading-tight">Educational & Welfare Society</p>
                    </div>
                  </div>

                  {/* Navigation Content */}
                  <nav className="flex-1 overflow-y-auto px-4 py-6">
                    {/* Services Section */}
                    <div className="mb-6">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                        Services
                      </h3>
                      <div className="space-y-1">
                        {servicesDropdown.map((item) => (
                          <Link 
                            key={item.name}
                            href={item.href}
                            className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 group"
                            onClick={() => setIsMobileMenuOpen(false)}
                            data-testid={`link-mobile-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <span className="group-hover:translate-x-1 transition-transform duration-200">
                              {item.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                    
                    {/* Main Navigation Items */}
                    <div className="mb-6">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                        Navigation
                      </h3>
                      <div className="space-y-1">
                        {navigation.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 group"
                            onClick={() => setIsMobileMenuOpen(false)}
                            data-testid={`link-mobile-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <span className="group-hover:translate-x-1 transition-transform duration-200">
                              {item.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Pages Section */}
                    <div className="mb-6">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                        Pages
                      </h3>
                      <div className="space-y-1">
                        {pagesDropdown.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 group"
                            onClick={() => setIsMobileMenuOpen(false)}
                            data-testid={`link-mobile-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <span className="group-hover:translate-x-1 transition-transform duration-200">
                              {item.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                    
                    {/* Currency Selector */}
                    <div className="mb-6 pb-6 border-b">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2 block">
                        Currency
                      </label>
                      <div className="px-2">
                        <CurrencySelector />
                      </div>
                    </div>
                  </nav>
                  
                  {/* Action Buttons Footer */}
                  <div className="border-t bg-muted/30 px-4 py-4 space-y-2.5">
                    {isLoggedIn ? (
                      <Link href={getDashboardLink()} onClick={() => setIsMobileMenuOpen(false)} className="block">
                        <Button 
                          variant="outline"
                          className="w-full font-semibold h-11 shadow-sm hover:shadow transition-shadow"
                          data-testid="button-dashboard-mobile"
                        >
                          DASHBOARD
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block">
                        <Button 
                          variant="outline"
                          className="w-full font-semibold h-11 shadow-sm hover:shadow transition-shadow"
                          data-testid="button-login-mobile"
                        >
                          LOGIN
                        </Button>
                      </Link>
                    )}
                    <Link href="/donate" onClick={() => setIsMobileMenuOpen(false)} className="block">
                      <Button 
                        className="w-full btn-primary font-semibold h-11 shadow-lg hover:shadow-xl transition-all"
                        data-testid="button-donate-mobile"
                      >
                        DONATE NOW
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
