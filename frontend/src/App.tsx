import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Registration from "./pages/Registration";
import NotFound from "./pages/NotFound";
import StartupMitra from "./pages/StartupMitra";
import CommunityHub from "./pages/CommunityHub";
import Dashboard from "./pages/Dashboard";
import Tourism from "./pages/Tourism";
import Inventory from "./pages/Inventory";
import Reviews from "./pages/ReviewsPage";
import ChefGuru from "./pages/ChefGuru";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";

import PosterMaker from "./pages/PosterMaker";
import SalesTracker from "./pages/SalesTracker";
import LicenseHelp from "./pages/LicenseHelp";
import Feedback from "./pages/Feedback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/registration" element={<Registration />} />
              <Route path="/startup-mitra" element={<StartupMitra />} />
              <Route path="/community-hub" element={<CommunityHub />} />
              <Route path="/tourism" element={<Tourism />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/trend-insights" element={<Reviews />} />

              <Route path="/chef-guru" element={<ChefGuru />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/poster-maker" element={<PosterMaker />} />
              <Route path="/sales-tracker" element={<SalesTracker />} />
              <Route path="/license-help" element={<LicenseHelp />} />
              <Route path="/feedback" element={<Feedback />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
