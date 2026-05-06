import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { CurrentWorkspaceProvider } from "@/hooks/useCurrentWorkspace";
import { RouteTracker } from "@/components/analytics/RouteTracker";
import { InviteAcceptanceGuard } from "@/components/auth/InviteAcceptanceGuard";
import { AppRoutes } from "@/routes/AppRoutes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <CurrentWorkspaceProvider>
              <RouteTracker />
              <InviteAcceptanceGuard>
                <AppRoutes />
              </InviteAcceptanceGuard>
            </CurrentWorkspaceProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
