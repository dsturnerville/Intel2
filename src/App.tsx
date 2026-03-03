import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import Auth from "./pages/Auth";
import Dispositions from "./pages/Dispositions";
import DispositionDetail from "./pages/DispositionDetail";
import NewDisposition from "./pages/NewDisposition";
import Acquisitions from "./pages/Acquisitions";
import Markets from "./pages/Markets";
import AcquisitionDetail from "./pages/AcquisitionDetail";
import NewAcquisition from "./pages/NewAcquisition";
import Units from "./pages/Units";
import UnitDetail from "./pages/UnitDetail";
import RentalComps from "./pages/RentalComps";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dispositions"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dispositions />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dispositions/new"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <NewDisposition />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dispositions/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DispositionDetail />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/acquisitions"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Acquisitions />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/acquisitions/new"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <NewAcquisition />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/acquisitions/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AcquisitionDetail />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/markets"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Markets />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/units"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Units />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/units/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <UnitDetail />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/units/:id/rental-comps"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <RentalComps />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Profile />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
