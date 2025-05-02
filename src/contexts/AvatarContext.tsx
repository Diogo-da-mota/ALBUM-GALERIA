import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface AvatarContextType {
  avatarUrl: string | null; // URL já com cache-busting
  updateAvatar: (baseUrl: string) => void;
  getBaseUrl: () => string | null; // Função para obter a URL base se necessário
}

const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

export function AvatarProvider({ children }: { children: React.ReactNode }) {
  console.log("AvatarProvider Render/Re-render"); // Log de Render do Provider

  // Armazena a URL base para persistência
  const [baseUrl, setBaseUrl] = useState<string | null>(() => {
    try {
      const storedUser = localStorage.getItem('user');
      console.log('[AvatarContext Init] Raw localStorage user:', storedUser);
      const user = storedUser ? JSON.parse(storedUser) : {};
      const initialUrl = user?.avatar_url || null;
      console.log('[AvatarContext Init] Initial base URL from localStorage:', initialUrl);
      return initialUrl;
    } catch (error) {
       console.error('[AvatarContext Init] Error reading localStorage:', error);
       return null;
    }
  });
  // Estado para forçar atualização do cache-buster
  const [displayVersion, setDisplayVersion] = useState<number>(Date.now());

  // Gera a URL de exibição com base na baseUrl e na versão
  const avatarUrl = useMemo(() => {
    const url = baseUrl ? `${baseUrl}?v=${displayVersion}` : null;
    console.log(`[AvatarContext] Recalculating avatarUrl: ${url} (Base: ${baseUrl}, Version: ${displayVersion})`); // Log de Recálculo
    return url;
  }, [baseUrl, displayVersion]);

  // Atualiza a URL base e dispara uma nova versão para cache-busting
  const updateAvatar = useCallback((newBaseUrl: string) => {
    console.log(`[AvatarContext] updateAvatar called with: ${newBaseUrl}`); // Log de Chamada
    const newVersion = Date.now();
    console.log(`[AvatarContext] Updating state - New Base: ${newBaseUrl}, New Version: ${newVersion}`);
    setBaseUrl(newBaseUrl);
    setDisplayVersion(newVersion);
    // Log *after* state is set (might not show immediately due to async nature)
    console.log(`[AvatarContext] State update potentially queued.`);

    // Atualiza localStorage apenas com URL base
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      userData.avatar_url = newBaseUrl;
      const updatedUserString = JSON.stringify(userData);
      console.log('[AvatarContext Update] Saving to localStorage:', updatedUserString);
      localStorage.setItem('user', updatedUserString);
    } catch (error) {
      console.error('[AvatarContext Update] Error writing to localStorage:', error);
    }
  }, []);

  // Função para obter a URL base (caso algum componente precise dela)
  const getBaseUrl = useCallback(() => baseUrl, [baseUrl]);

  return (
    <AvatarContext.Provider value={{ 
      avatarUrl,      // Fornece a URL já com cache-busting
      updateAvatar,   // Função para atualizar URL base e disparar re-render
      getBaseUrl      // Função para obter a URL base
    }}>
      {children}
    </AvatarContext.Provider>
  );
}

export function useAvatar() {
  const context = useContext(AvatarContext);
  if (context === undefined) {
    throw new Error('useAvatar must be used within an AvatarProvider');
  }
  return context;
} 