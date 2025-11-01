import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Menu } from "lucide-react";
import { AuthProvider, withAuth } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { GlobalFiltersProvider } from "@/contexts/GlobalFiltersContext";

// Core pages - eager loading
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import EmployeeDetail from "./pages/EmployeeDetail";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import Upload from "./pages/Upload";
import Transfers from "./pages/Transfers";
import Costs from "./pages/Costs";
import Audit from "./pages/Audit";
import Budget from "./pages/Budget";
import BudgetDetail from "./pages/BudgetDetail";
import Login from "./pages/Login";
import Setup from "./pages/Setup";
import NotFound from "./pages/NotFound";
import PublicOnboarding from "./pages/PublicOnboarding";
import Recruitment from "./pages/Recruitment";
import Compensation from "./pages/Compensation";
import DealsTracker from "./pages/DealsTracker";
import CompensationScales from "./pages/CompensationScales";
import CostsOverview from "./pages/CostsOverview";

// Admin pages - lazy loading (code splitting)
const AdminRoles = lazy(() => import("./pages/AdminRoles"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminCompanies = lazy(() => import("./pages/AdminCompanies"));
const AdminRolesConfig = lazy(() => import("./pages/AdminRolesConfig"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AdminImportHistory = lazy(() => import("./pages/AdminImportHistory"));
const AdminOnboarding = lazy(() => import("./pages/AdminOnboarding"));
const AdminDepartments = lazy(() => import("./pages/AdminDepartments"));

// Loading fallback
const PageLoader = () => (
  <div className="p-6 space-y-4">
    <Skeleton className="h-8 w-64" />
    <Skeleton className="h-64 w-full" />
  </div>
);

const queryClient = new QueryClient();

// Protected routes
const ProtectedDashboard = withAuth(['admin', 'finance', 'super_admin'])(Dashboard);
const ProtectedCosts = withAuth(['admin', 'finance', 'super_admin'])(Costs);
const ProtectedCostsOverview = withAuth(['admin', 'finance', 'super_admin'])(CostsOverview);
const ProtectedAudit = withAuth(['admin', 'super_admin'])(Audit);
const ProtectedBudget = withAuth(['admin', 'finance', 'super_admin'])(Budget);
const ProtectedBudgetDetail = withAuth(['admin', 'finance', 'super_admin'])(BudgetDetail);
const ProtectedEmployees = withAuth(['admin', 'manager', 'super_admin'])(Employees);
const ProtectedEmployeeDetail = withAuth(['admin', 'manager', 'super_admin'])(EmployeeDetail);
const ProtectedCompanies = withAuth(['admin', 'finance', 'super_admin'])(Companies);
const ProtectedCompanyDetail = withAuth(['admin', 'finance', 'super_admin'])(CompanyDetail);
const ProtectedUpload = withAuth(['admin', 'super_admin'])(Upload);
const ProtectedTransfers = withAuth(['admin', 'manager', 'super_admin'])(Transfers);
const ProtectedRecruitment = withAuth(['admin', 'manager', 'super_admin'])(Recruitment);
const ProtectedCompensation = withAuth(['admin', 'finance', 'super_admin'])(Compensation);
const ProtectedDealsTracker = withAuth(['admin', 'finance', 'super_admin'])(DealsTracker);
const ProtectedCompensationScales = withAuth(['admin', 'finance', 'super_admin'])(CompensationScales);
const ProtectedAdminRoles = withAuth(['super_admin'])(AdminRoles);
const ProtectedAdminUsers = withAuth(['super_admin'])(AdminUsers);
const ProtectedAdminCompanies = withAuth(['super_admin'])(AdminCompanies);
const ProtectedAdminRolesConfig = withAuth(['super_admin'])(AdminRolesConfig);
const ProtectedAdminSettings = withAuth(['super_admin'])(AdminSettings);
const ProtectedAdminImportHistory = withAuth(['super_admin'])(AdminImportHistory);
const ProtectedAdminOnboarding = withAuth(['admin', 'super_admin'])(AdminOnboarding);
const ProtectedAdminDepartments = withAuth(['super_admin'])(AdminDepartments);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <GlobalFiltersProvider>
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
                    <Route path="/onboarding/:token" element={<PublicOnboarding />} />
                    <Route path="/" element={<ProtectedDashboard />} />
                    <Route path="/dashboard" element={<ProtectedDashboard />} />
              <Route path="/employees" element={<ProtectedEmployees />} />
              <Route path="/employees/:id" element={<ProtectedEmployeeDetail />} />
              <Route path="/recruitment" element={<ProtectedRecruitment />} />
              <Route path="/companies" element={<ProtectedCompanies />} />
              <Route path="/companies/:id" element={<ProtectedCompanyDetail />} />
              <Route path="/upload" element={<ProtectedUpload />} />
              <Route path="/transfers" element={<ProtectedTransfers />} />
                    <Route path="/costs" element={<ProtectedCosts />} />
                    <Route path="/costs-overview" element={<ProtectedCostsOverview />} />
                    <Route path="/budget" element={<ProtectedBudget />} />
                    <Route path="/budget/new" element={<ProtectedBudgetDetail />} />
                    <Route path="/budget/:id" element={<ProtectedBudgetDetail />} />
                    <Route path="/compensation" element={<ProtectedCompensation />} />
                    <Route path="/compensation/deals" element={<ProtectedDealsTracker />} />
                    <Route path="/compensation/scales" element={<ProtectedCompensationScales />} />
                    <Route path="/audit" element={<ProtectedAudit />} />
                <Route path="/admin/roles" element={
                  <Suspense fallback={<PageLoader />}>
                    <ProtectedAdminRoles />
                  </Suspense>
                } />
                <Route path="/admin/users" element={
                  <Suspense fallback={<PageLoader />}>
                    <ProtectedAdminUsers />
                  </Suspense>
                } />
                <Route path="/admin/companies" element={
                  <Suspense fallback={<PageLoader />}>
                    <ProtectedAdminCompanies />
                  </Suspense>
                } />
                <Route path="/admin/roles-config" element={
                  <Suspense fallback={<PageLoader />}>
                    <ProtectedAdminRolesConfig />
                  </Suspense>
                } />
                <Route path="/admin/settings" element={
                  <Suspense fallback={<PageLoader />}>
                    <ProtectedAdminSettings />
                  </Suspense>
                } />
                <Route path="/admin/import-history" element={
                  <Suspense fallback={<PageLoader />}>
                    <ProtectedAdminImportHistory />
                  </Suspense>
                } />
                <Route path="/admin/onboarding" element={
                  <Suspense fallback={<PageLoader />}>
                    <ProtectedAdminOnboarding />
                  </Suspense>
                } />
                <Route path="/admin/departments" element={
                  <Suspense fallback={<PageLoader />}>
                    <ProtectedAdminDepartments />
                  </Suspense>
                } />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </div>
          </SidebarProvider>
          </GlobalFiltersProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
