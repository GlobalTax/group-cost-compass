import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Menu } from "lucide-react";
import { AuthProvider, withAuth } from "@/lib/auth";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import EmployeeDetail from "./pages/EmployeeDetail";
import Companies from "./pages/Companies";
import Upload from "./pages/Upload";
import Transfers from "./pages/Transfers";
import Costs from "./pages/Costs";
import Audit from "./pages/Audit";
import Login from "./pages/Login";
import Setup from "./pages/Setup";
import AdminRoles from "./pages/AdminRoles";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected routes
const ProtectedDashboard = withAuth(['admin', 'finance', 'super_admin'])(Dashboard);
const ProtectedCosts = withAuth(['admin', 'finance', 'super_admin'])(Costs);
const ProtectedAudit = withAuth(['admin', 'super_admin'])(Audit);
const ProtectedEmployees = withAuth(['admin', 'manager', 'super_admin'])(Employees);
const ProtectedEmployeeDetail = withAuth(['admin', 'manager', 'super_admin'])(EmployeeDetail);
const ProtectedCompanies = withAuth(['admin', 'finance', 'super_admin'])(Companies);
const ProtectedUpload = withAuth(['admin', 'super_admin'])(Upload);
const ProtectedTransfers = withAuth(['admin', 'manager', 'super_admin'])(Transfers);
const ProtectedAdminRoles = withAuth(['super_admin'])(AdminRoles);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SidebarProvider defaultOpen>
            <a 
              href="#main-content" 
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
            >
              Saltar al contenido principal
            </a>
            <div className="min-h-screen flex w-full bg-background">
              <AppSidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-6">
                  <SidebarTrigger>
                    <Menu className="h-5 w-5" />
                  </SidebarTrigger>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-auto">
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/setup" element={<Setup />} />
                    <Route path="/" element={<ProtectedDashboard />} />
                    <Route path="/dashboard" element={<ProtectedDashboard />} />
                    <Route path="/employees" element={<ProtectedEmployees />} />
                    <Route path="/employees/:id" element={<ProtectedEmployeeDetail />} />
                    <Route path="/companies" element={<ProtectedCompanies />} />
                    <Route path="/upload" element={<ProtectedUpload />} />
                    <Route path="/transfers" element={<ProtectedTransfers />} />
                    <Route path="/costs" element={<ProtectedCosts />} />
                    <Route path="/audit" element={<ProtectedAudit />} />
                    <Route path="/admin/roles" element={<ProtectedAdminRoles />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
