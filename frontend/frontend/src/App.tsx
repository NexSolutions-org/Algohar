import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, createContext, useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import DonateRation from "./pages/DonateRation";
import Services from "./pages/Services";
import FreeEducation from "./pages/FreeEducation";
import Projects from "./pages/Projects";
import Reports from "./pages/Reports";
import Blogs from "./pages/Blogs";
import BlogDetail from "./pages/BlogDetail";
import About from "./pages/About";
import BankDetails from "./pages/BankDetails";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Donate from "./pages/Donate";
import DonateQurbani from "./pages/DonateQurbani";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";
import NotFound from "./pages/not-found";
import Dashboard from "./pages/user/Dashboard";
import DonateNow from "./pages/user/Donate-Now";
import MyDonations from "./pages/user/My-Donations";
import Payments from "./pages/user/Payments";
import Settings from "./pages/user/Settings";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminDonations from "./pages/admin/Donations";
import AdminPayments from "./pages/admin/Payments";
import AdminSettings from "./pages/admin/Settings";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import ProtectedUserRoute from "./components/ProtectedUserRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import DeveloperLogin from "./pages/developer/DeveloperLogin";
import ForgotPassword from "./pages/developer/ForgotPassword";
import ResetPassword from "./pages/developer/ResetPassword";
import DomainBlock from "./pages/developer/DomainBlock";
import DeveloperLayout from "./components/developer/DeveloperLayout";
import ProtectedDeveloperRoute from "./components/ProtectedDeveloperRoute";
import DomainBlockCheck from "./components/DomainBlockCheck";

export const DonationModalContext = createContext<{
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}>({
  isOpen: false,
  openModal: () => {},
  closeModal: () => {},
});

function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return null;
}

function Router() {
  return (
    <DomainBlockCheck>
      <Layout>
        <ScrollToTop />
        <Switch>
        <Route path="/" component={Home} />
        <Route path="/donate/ration" component={DonateRation} />
        <Route path="/donate/qurbani" component={DonateQurbani} />
        <Route path="/services" component={Services} />
        <Route path="/free-education" component={FreeEducation} />
        <Route path="/projects" component={Projects} />
        <Route path="/reports" component={Reports} />
        <Route path="/blogs" component={Blogs} />
        <Route path="/blogs/:id" component={BlogDetail} />
        <Route path="/about" component={About} />
        <Route path="/bank-details" component={BankDetails} />
        <Route path="/contact" component={Contact} />
        <Route path="/login" component={Login} />
        <Route path="/donate" component={Donate} />
        {/* Payment Callback Routes */}
        <Route path="/payment/success" component={PaymentSuccess} />
        <Route path="/payment/failure" component={PaymentFailure} />
        {/* User Panel Routes - Protected */}
        <Route path="/user/dashboard">
          <ProtectedUserRoute>
            <Dashboard />
          </ProtectedUserRoute>
        </Route>
        <Route path="/user/donate-now">
          <ProtectedUserRoute>
            <DonateNow />
          </ProtectedUserRoute>
        </Route>
        <Route path="/user/my-donations">
          <ProtectedUserRoute>
            <MyDonations />
          </ProtectedUserRoute>
        </Route>
        <Route path="/user/payments">
          <ProtectedUserRoute>
            <Payments />
          </ProtectedUserRoute>
        </Route>
        <Route path="/user/settings">
          <ProtectedUserRoute>
            <Settings />
          </ProtectedUserRoute>
        </Route>
        {/* Admin Panel Routes - Protected */}
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin">
          {() => {
            return <Redirect to="/admin/login" />;
          }}
        </Route>
        <Route path="/admin/dashboard">
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        </Route>
        <Route path="/admin/users">
          <ProtectedAdminRoute>
            <AdminUsers />
          </ProtectedAdminRoute>
        </Route>
        <Route path="/admin/donations">
          <ProtectedAdminRoute>
            <AdminDonations />
          </ProtectedAdminRoute>
        </Route>
        <Route path="/admin/payments">
          <ProtectedAdminRoute>
            <AdminPayments />
          </ProtectedAdminRoute>
        </Route>
        <Route path="/admin/settings">
          <ProtectedAdminRoute>
            <AdminSettings />
          </ProtectedAdminRoute>
        </Route>
        <Route path="/admin/projects">
          <ProtectedAdminRoute>
            <AdminLayout>
              <div>
                <h1 className="text-2xl font-bold">Projects Management</h1>
                <p className="text-muted-foreground mt-2">This page is under construction.</p>
              </div>
            </AdminLayout>
          </ProtectedAdminRoute>
        </Route>
        <Route path="/admin/blogs">
          <ProtectedAdminRoute>
            <AdminLayout>
              <div>
                <h1 className="text-2xl font-bold">Blogs Management</h1>
                <p className="text-muted-foreground mt-2">This page is under construction.</p>
              </div>
            </AdminLayout>
          </ProtectedAdminRoute>
        </Route>
        <Route path="/admin/reports">
          <ProtectedAdminRoute>
            <AdminLayout>
              <div>
                <h1 className="text-2xl font-bold">Reports & Analytics</h1>
                <p className="text-muted-foreground mt-2">This page is under construction.</p>
              </div>
            </AdminLayout>
          </ProtectedAdminRoute>
        </Route>
        <Route path="/admin/media">
          <ProtectedAdminRoute>
            <AdminLayout>
              <div>
                <h1 className="text-2xl font-bold">Media Library</h1>
                <p className="text-muted-foreground mt-2">This page is under construction.</p>
              </div>
            </AdminLayout>
          </ProtectedAdminRoute>
        </Route>
        <Route path="/admin/messages">
          <ProtectedAdminRoute>
            <AdminLayout>
              <div>
                <h1 className="text-2xl font-bold">Messages</h1>
                <p className="text-muted-foreground mt-2">This page is under construction.</p>
              </div>
            </AdminLayout>
          </ProtectedAdminRoute>
        </Route>
        {/* Developer Panel Routes */}
        <Route path="/developer/login" component={DeveloperLogin} />
        <Route path="/developer/forgot-password" component={ForgotPassword} />
        <Route path="/developer/reset-password" component={ResetPassword} />
        <Route path="/developer">
          {() => {
            return <Redirect to="/developer/login" />;
          }}
        </Route>
        <Route path="/developer/domain-block">
          <ProtectedDeveloperRoute>
            <DeveloperLayout>
              <DomainBlock />
            </DeveloperLayout>
          </ProtectedDeveloperRoute>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Layout>
    </DomainBlockCheck>
  );
}

function App() {
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <CurrencyProvider>
            <TooltipProvider>
              <DonationModalContext.Provider 
                value={{
                  isOpen: isDonationModalOpen,
                  openModal: () => setIsDonationModalOpen(true),
                  closeModal: () => setIsDonationModalOpen(false),
                }}
              >
                <Toaster />
                <Router />
              </DonationModalContext.Provider>
            </TooltipProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
