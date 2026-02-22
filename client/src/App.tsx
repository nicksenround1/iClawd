import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import SoulEditor from "./pages/SoulEditor";
import SkillStore from "./pages/SkillStore";
import SetupWizard from "./pages/SetupWizard";
import Models from "./pages/Models";
import Layout from "./components/Layout";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"}>
        <Layout>
          <Dashboard />
        </Layout>
      </Route>
      <Route path={"/soul"}>
        <Layout>
          <SoulEditor />
        </Layout>
      </Route>
      <Route path={"/skills"}>
        <Layout>
          <SkillStore />
        </Layout>
      </Route>
      <Route path={"/models"}>
        <Layout>
          <Models />
        </Layout>
      </Route>
      <Route path={"/setup"}>
        <SetupWizard />
      </Route>
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
