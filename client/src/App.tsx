import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ProjectOverview from "./pages/ProjectOverview";
import ResearchIntake from "./pages/ResearchIntake";
import IntelligenceExtract from "./pages/IntelligenceExtract";
import MarketResearch from "./pages/MarketResearch";
import BuyerJourney from "./pages/BuyerJourney";
import AwarenessDiagnosis from "./pages/AwarenessDiagnosis";
import ThresholdGap from "./pages/ThresholdGap";
import MentalSteps from "./pages/MentalSteps";
import FunnelSkeleton from "./pages/FunnelSkeleton";
import DraftingStudio from "./pages/DraftingStudio";
import SelfReview from "./pages/SelfReview";
import CompetitorReview from "./pages/CompetitorReview";
import ExportReport from "./pages/ExportReport";
import AdminPanel from "./pages/AdminPanel";
import Pricing from "./pages/Pricing";
import TrialExpired from "./pages/TrialExpired";
import Settings from "./pages/Settings";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import AppLayout from "./components/AppLayout";

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Home} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/trial-expired" component={TrialExpired} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />

      {/* App — protected */}
      <Route path="/dashboard">
        {() => <AppLayout><Dashboard /></AppLayout>}
      </Route>
      <Route path="/settings">
        {() => <AppLayout><Settings /></AppLayout>}
      </Route>
      <Route path="/projects/:id">
        {() => <AppLayout><ProjectOverview /></AppLayout>}
      </Route>
      <Route path="/projects/:id/research">
        {() => <AppLayout><ResearchIntake /></AppLayout>}
      </Route>
      <Route path="/projects/:id/intelligence">
        {() => <AppLayout><IntelligenceExtract /></AppLayout>}
      </Route>
      <Route path="/projects/:id/market-research">
        {() => <AppLayout><MarketResearch /></AppLayout>}
      </Route>
      <Route path="/projects/:id/buyer-journey">
        {() => <AppLayout><BuyerJourney /></AppLayout>}
      </Route>
      <Route path="/projects/:id/awareness">
        {() => <AppLayout><AwarenessDiagnosis /></AppLayout>}
      </Route>
      <Route path="/projects/:id/thresholds">
        {() => <AppLayout><ThresholdGap /></AppLayout>}
      </Route>
      <Route path="/projects/:id/mental-steps">
        {() => <AppLayout><MentalSteps /></AppLayout>}
      </Route>
      <Route path="/projects/:id/funnel-skeleton">
        {() => <AppLayout><FunnelSkeleton /></AppLayout>}
      </Route>
      <Route path="/projects/:id/drafting">
        {() => <AppLayout><DraftingStudio /></AppLayout>}
      </Route>
      <Route path="/projects/:id/self-review">
        {() => <AppLayout><SelfReview /></AppLayout>}
      </Route>
      <Route path="/projects/:id/competitor-review">
        {() => <AppLayout><CompetitorReview /></AppLayout>}
      </Route>
      <Route path="/projects/:id/export">
        {() => <AppLayout><ExportReport /></AppLayout>}
      </Route>

      {/* Admin */}
      <Route path="/admin">
        {() => <AppLayout><AdminPanel /></AppLayout>}
      </Route>

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: "oklch(0.13 0.015 240)",
                border: "1px solid oklch(0.65 0.35 340 / 0.4)",
                color: "oklch(0.92 0.02 240)",
              },
            }}
          />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
