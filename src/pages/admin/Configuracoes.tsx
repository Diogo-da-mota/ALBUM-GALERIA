import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Importar os componentes das abas (serão criados a seguir)
import PerfilTab from '@/components/admin/configuracoes/PerfilTab';
import ImagemTab from '@/components/admin/configuracoes/ImagemTab';

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6 relative min-h-[calc(100vh-10rem)]"> 
      {/* Background Sutil - Substitua pela sua imagem se desejar */}
      <div 
        className="absolute inset-0 -z-10 bg-gradient-to-br from-[#0b0f17] via-[#111827] to-[#0b0f17] opacity-50"
        // Exemplo com imagem: style={{ backgroundImage: 'url(/path/to/your/image.jpg)', backgroundSize: 'cover', opacity: 0.1 }}
      ></div>

      {/* Header da Página */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Configurações</h1>
      </div>

      {/* Sistema de Abas */}
      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex h-auto mb-6 bg-transparent p-0">
           {/* Ajuste de estilo para as abas ficarem parecidas com a imagem */}
          <TabsTrigger 
            value="perfil" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white hover:bg-gray-700/50 rounded-md px-4 py-2 transition-colors duration-200 mr-2"
          >
            {/* Ícone pode ser adicionado aqui se necessário */}
             Perfil
          </TabsTrigger>
          <TabsTrigger 
            value="imagem" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white hover:bg-gray-700/50 rounded-md px-4 py-2 transition-colors duration-200"
          >
            {/* Ícone pode ser adicionado aqui se necessário */}
            Imagem
          </TabsTrigger>
           {/* Outras abas podem ser adicionadas aqui no futuro */}
        </TabsList>

        {/* Conteúdo das Abas */}
        <TabsContent value="perfil">
          <PerfilTab />
        </TabsContent>
        <TabsContent value="imagem">
          <ImagemTab />
        </TabsContent>
      </Tabs>
    </div>
  );
} 