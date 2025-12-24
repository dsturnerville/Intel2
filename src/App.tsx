import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
import Dispositions from "./pages/Dispositions";
import DispositionDetail from "./pages/DispositionDetail";
import NewDisposition from "./pages/NewDisposition";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dispositions" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/dispositions"
            element={
              <ProtectedRoute>
                <Dispositions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dispositions/new"
            element={
              <ProtectedRoute>
                <NewDisposition />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dispositions/:id"
            element={
              <ProtectedRoute>
                <DispositionDetail />
              </ProtectedRoute>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
