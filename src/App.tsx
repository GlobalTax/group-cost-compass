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
import { ErrorBoundary } from "@/components/error/ErrorBoundary";

// Core pages - eager loading (críticas para FCP)
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import EmployeeDetail from "./pages/EmployeeDetail";
import CompanyDetail from "./pages/CompanyDetail";
import Login from "./pages/Login";
import Setup from "./pages/Setup";
import NotFound from "./pages/NotFound";
import PublicOnboarding from "./pages/PublicOnboarding";
import { Navigate } from "react-router-dom";

// Secondary pages - lazy loading (code splitting)
const Upload = lazy(() => import("./pages/Upload"));
const Transfers = lazy(() => import("./pages/Transfers"));
const Costs = lazy(() => import("./pages/Costs"));
const Audit = lazy(() => import("./pages/Audit"));
const Budget = lazy(() => import("./pages/Budget"));
const BudgetDetail = lazy(() => import("./pages/BudgetDetail"));
const Recruitment = lazy(() => import("./pages/Recruitment"));
const Compensation = lazy(() => import("./pages/Compensation"));
const DealsTracker = lazy(() => import("./pages/DealsTracker"));
const CompensationScales = lazy(() => import("./pages/CompensationScales"));
const CostsOverview = lazy(() => import("./pages/CostsOverview"));
const CostsByCompany = lazy(() => import("./pages/CostsByCompany"));
const CostsMatrix = lazy(() => import("./pages/CostsMatrix"));
const Revenues = lazy(() => import("./pages/Revenues"));
const MonthlyClosing = lazy(() => import("./pages/MonthlyClosing"));

// Admin pages - lazy loading (code splitting)
const AdminRoles = lazy(() => import("./pages/AdminRoles"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminCompanies = lazy(() => import("./pages/AdminCompanies"));
const AdminRolesConfig = lazy(() => import("./pages/AdminRolesConfig"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AdminImportHistory = lazy(() => import("./pages/AdminImportHistory"));
const AdminOnboarding = lazy(() => import("./pages/AdminOnboarding"));
const AdminDepartments = lazy(() => import("./pages/AdminDepartments"));
const AdminTeams = lazy(() => import("./pages/AdminTeams"));

// Loading fallback
const PageLoader = () => (
  <div className="p-6 space-y-4">
    <Skeleton className="h-8 w-64" />
    <Skeleton className="h-64 w-full" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minuto - datos frescos
      gcTime: 300000, // 5 minutos - garbage collection
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 0,
      onError: (error) => {
        console.error('[React Query] Mutation error:', error);
      },
    },
  },
});

// Protected routes
const ProtectedDashboard = withAuth(['admin', 'finance', 'super_admin'])(Dashboard);
const ProtectedCosts = withAuth(['admin', 'finance', 'super_admin'])(Costs);
const ProtectedCostsOverview = withAuth(['admin', 'finance', 'super_admin'])(CostsOverview);
const ProtectedCostsByCompany = withAuth(['admin', 'finance', 'super_admin'])(CostsByCompany);
const ProtectedCostsMatrix = withAuth(['admin', 'finance', 'super_admin'])(CostsMatrix);
const ProtectedRevenues = withAuth(['admin', 'finance', 'super_admin'])(Revenues);
const ProtectedMonthlyClosing = withAuth(['admin', 'finance', 'super_admin'])(MonthlyClosing);
const ProtectedAudit = withAuth(['admin', 'super_admin'])(Audit);
const ProtectedBudget = withAuth(['admin', 'finance', 'super_admin'])(Budget);
const ProtectedBudgetDetail = withAuth(['admin', 'finance', 'super_admin'])(BudgetDetail);
const ProtectedEmployees = withAuth(['admin', 'manager', 'super_admin'])(Employees);
const ProtectedEmployeeDetail = withAuth(['admin', 'manager', 'super_admin'])(EmployeeDetail);
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
const ProtectedAdminTeams = withAuth(['super_admin'])(AdminTeams);

const App = () => (
  <ErrorBoundary context="App">
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
                    <Route path="/employees" element={<Navigate to="/costs-overview" replace />} />
                    <Route path="/employees/:id" element={<ProtectedEmployeeDetail />} />
              <Route path="/recruitment" element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedRecruitment />
                </Suspense>
              } />
              <Route path="/companies/:id" element={<ProtectedCompanyDetail />} />
              <Route path="/upload" element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedUpload />
                </Suspense>
              } />
              <Route path="/transfers" element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedTransfers />
                </Suspense>
              } />
              <Route path="/costs" element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedCosts />
                </Suspense>
              } />
              <Route path="/costs-overview" element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedCostsOverview />
                </Suspense>
              } />
              <Route path="/costs-by-company" element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedCostsByCompany />
                </Suspense>
              } />
              <Route path="/costs-matrix" element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedCostsMatrix />
                </Suspense>
              } />
              <Route path="/monthly-closing" element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedMonthlyClosing />
                </Suspense>
              } />
              <Route path="/revenues" element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedRevenues />
                </Suspense>
              } />
              <Route path="/budget" element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedBudget />
                </Suspense>
              } />
              <Route path="/budget/new" element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedBudgetDetail />
                </Suspense>
              } />
              <Route path="/budget/:id" element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedBudgetDetail />
                </Suspense>
              } />
              <Route path="/compensation" element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedCompensation />
                </Suspense>
              } />
              <Route path="/compensation/deals" element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedDealsTracker />
                </Suspense>
              } />
              <Route path="/compensation/scales" element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedCompensationScales />
                </Suspense>
              } />
              <Route path="/audit" element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedAudit />
                </Suspense>
              } />
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
                <Route path="/admin/teams" element={
                  <Suspense fallback={<PageLoader />}>
                    <ProtectedAdminTeams />
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
  </ErrorBoundary>
);

export default App;
