import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles: string[]; // Roles permitidas para acessar a rota
}

// Função para buscar dados do usuário do localStorage
const getUserFromLocalStorage = () => {
  const storedUser = localStorage.getItem('user');
  try {
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (e) {
    console.error("Erro ao parsear usuário do localStorage:", e);
    localStorage.removeItem('user'); // Remove item inválido
    return null;
  }
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const user = getUserFromLocalStorage();

  // Verifica se o usuário existe e se sua role está entre as permitidas
  const isAuthorized = user && allowedRoles.includes(user.role);

  // Se não estiver autorizado, redireciona para a página de login
  if (!isAuthorized) {
    // Poderíamos guardar a rota que ele tentou acessar para redirecionar após login,
    // mas por simplicidade, apenas redirecionamos para a raiz.
    return <Navigate to="/" replace />;
  }

  // Se estiver autorizado, renderiza o conteúdo da rota filha (Outlet)
  return <Outlet />;
};

export default ProtectedRoute; 