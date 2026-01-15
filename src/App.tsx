import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TournamentProvider } from "@/context/TournamentContext";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import Organizador from "./pages/Organizador";
import Inscripcion from "./pages/Inscripcion";
import Grupos from "./pages/Grupos";
import Cuadro from "./pages/Cuadro";
import Gestion from "./pages/Gestion";
import NotFound from "./pages/NotFound";
import PublicRegistration from "./pages/PublicRegistration";

import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TournamentProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/inscripcion" element={<PublicRegistration />} />
              <Route path="/login" element={<Login />} />

              {/* Tournament Routes nested under /organizador - Protected */}
              <Route path="/organizador" element={<ProtectedRoute />}>
                <Route index element={<Navigate to="/organizador/panel-de-control" replace />} />
                <Route path="inscripcion" element={<Inscripcion />} />
                <Route path="grupos" element={<Grupos />} />
                <Route path="cuadro" element={<Cuadro />} />
                <Route path="panel-de-control" element={<Gestion />} />
                <Route path="dashboard" element={<Organizador />} /> {/* Keep Organizador page at dashboard if needed, or redirect */}
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </TournamentProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
