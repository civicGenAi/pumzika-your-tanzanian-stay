import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import ListingDetail from "./pages/ListingDetail";
import SearchResults from "./pages/SearchResults";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BecomeHost from "./pages/BecomeHost";
import HostDashboard from "./pages/HostDashboard";
import Saved from "./pages/Saved";
import Trips from "./pages/Trips";
import Inbox from "./pages/Inbox";
import AllListings from "./pages/AllListings";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";
import BookingSuccess from "./pages/BookingSuccess";
import NotFound from "./pages/NotFound";
import { AuthGuard } from "./components/AuthGuard";
import { AuthDrawerProvider } from "./context/AuthDrawerContext";
import { AuthDrawer } from "./components/AuthDrawer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthDrawerProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/explore" element={<AllListings />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/become-host" element={<AuthGuard><BecomeHost /></AuthGuard>} />
            <Route path="/host-dashboard/*" element={<AuthGuard><HostDashboard /></AuthGuard>} />
            <Route path="/saved" element={<AuthGuard><Saved /></AuthGuard>} />
            <Route path="/trips" element={<AuthGuard><Trips /></AuthGuard>} />
            <Route path="/inbox" element={<AuthGuard><Inbox /></AuthGuard>} />
            <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
            <Route path="/checkout" element={<AuthGuard><Checkout /></AuthGuard>} />
            <Route path="/booking-confirmation" element={<AuthGuard><BookingSuccess /></AuthGuard>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <AuthDrawer />
        </BrowserRouter>
      </AuthDrawerProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
