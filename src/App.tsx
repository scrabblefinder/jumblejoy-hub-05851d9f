import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => {
  // Get the current path
  const path = window.location.pathname;
  
  // Simple router
  const getComponent = () => {
    if (path.startsWith('/jumble/')) {
      const Answer = require('./pages/Answer').default;
      return <Answer />;
    }
    return <Index />;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {getComponent()}
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;