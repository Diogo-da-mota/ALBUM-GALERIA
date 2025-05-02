import { Toaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PrivateRoute } from "./components/PrivateRoute";
import { PublicLayout } from "./layouts/PublicLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { AvatarProvider } from './contexts/AvatarContext';

// Import pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Size from "./pages/Size";
import Pages from "./pages/Pages";
import Finish from "./pages/Finish";
import Case from "./pages/Case";
import Summary from "./pages/Summary";
import NotFound from "./pages/NotFound";
import { AdminDashboard } from "./pages/admin/Dashboard";
import Precos from "./pages/admin/Precos";
import Albuns from "./pages/admin/Albuns";
import Estojos from "./pages/admin/Estojos";
import FeedbacksPage from "./pages/admin/Feedbacks";
import ConfiguracoesPage from "./pages/admin/Configuracoes";
import PhotographerDashboard from "./pages/PhotographerDashboard";
import Index from "./pages/Index";
import PublicIndex from "./pages/PublicIndex";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AvatarProvider>
        <Toaster position="top-right" />
        <BrowserRouter>
          <Routes>
            {/* Redireciona a raiz para o login */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Rota pública para visualização do site */}
            <Route element={<PublicLayout />}>
              <Route path="/site" element={<PublicIndex />} />
              <Route path="/site/tamanho" element={<Size />} />
              <Route path="/site/paginas" element={<Pages />} />
              <Route path="/site/laminacao" element={<Finish />} />
              <Route path="/site/estojo" element={<Case />} />
              <Route path="/site/resumo" element={<Summary />} />
              <Route path="/site/pedido" element={<Summary />} />
            </Route>
            
            {/* Rotas protegidas para admin */}
            <Route
              path="/admin"
              element={
                <PrivateRoute requiredRole="admin">
                  <AdminLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="albuns" element={<Albuns />} />
              <Route path="estojos" element={<Estojos />} />
              <Route path="precos" element={<Precos />} />
              <Route path="feedbacks" element={<FeedbacksPage />} />
              <Route path="configuracoes" element={<ConfiguracoesPage />} />
            </Route>
            
            {/* Rotas protegidas para fotógrafo */}
            <Route
              path="/photographer"
              element={
                <PrivateRoute requiredRole="user">
                  <PhotographerDashboard />
                </PrivateRoute>
              }
            />

            {/* Rotas protegidas para o fluxo de pedido */}
            <Route
              path="/albuns"
              element={
                <PrivateRoute requiredRole="user">
                  <Index />
                </PrivateRoute>
              }
            />
            <Route
              path="/tamanho"
              element={
                <PrivateRoute requiredRole="user">
                  <Size />
                </PrivateRoute>
              }
            />
            <Route
              path="/paginas"
              element={
                <PrivateRoute requiredRole="user">
                  <Pages />
                </PrivateRoute>
              }
            />
            <Route
              path="/laminacao"
              element={
                <PrivateRoute requiredRole="user">
                  <Finish />
                </PrivateRoute>
              }
            />
            <Route
              path="/estojo"
              element={
                <PrivateRoute requiredRole="user">
                  <Case />
                </PrivateRoute>
              }
            />
            <Route
              path="/resumo"
              element={
                <PrivateRoute requiredRole="user">
                  <Summary />
                </PrivateRoute>
              }
            />
            <Route
              path="/pedido"
              element={
                <PrivateRoute requiredRole="user">
                  <Summary />
                </PrivateRoute>
              }
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AvatarProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
