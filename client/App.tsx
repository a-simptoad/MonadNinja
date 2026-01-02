import "./global.css";
import { Buffer } from "buffer";

globalThis.Buffer = Buffer;

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

import { PrivyProvider } from "@privy-io/react-auth";
import { config } from "@/config/wagmi";
import { WagmiProvider } from '@privy-io/wagmi';
import { privyConfig } from "./config/privy";

const queryClient = new QueryClient();

const App = () => (
  <PrivyProvider appId="cmjwo18ow00kuk70e2xr5nctn" config={privyConfig}>
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </WagmiProvider>
    </QueryClientProvider>
  </PrivyProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
