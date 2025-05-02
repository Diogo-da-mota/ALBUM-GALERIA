import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAlbumPrices } from "@/hooks/useAlbumPrices";
import SelectionCard from "@/components/ui/SelectionCard";
import PublicPageLayout from "@/components/layout/PublicPageLayout";
import { IdentificacaoCliente } from "@/components/identificacao/IdentificacaoCliente";
import toast from "@/components/ui/sonner";

export default function PublicIndex() {
  const navigate = useNavigate();
  const { prices, fetchPrices } = useAlbumPrices();
  const [loading, setLoading] = useState(true);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [clienteIdentificado, setClienteIdentificado] = useState(false);

  useEffect(() => {
    const clienteInfo = localStorage.getItem('cliente_info');
    if (clienteInfo) {
      try {
        JSON.parse(clienteInfo);
        setClienteIdentificado(true);
      } catch (e) {
        console.error("Erro ao parsear cliente_info do localStorage:", e);
        localStorage.removeItem('cliente_info');
      }
    }
    
    const loadData = async () => {
      try {
        await fetchPrices();
        const savedAlbum = localStorage.getItem("selectedAlbum");
        if (savedAlbum) {
          const parsed = JSON.parse(savedAlbum);
          setSelectedAlbumId(parsed.id);
        }
      } catch (error) {
        console.error("Erro ao carregar preços:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [fetchPrices]);

  const handleSelectAlbum = (albumId: string) => {
    setSelectedAlbumId(albumId);
    const selectedAlbum = prices.find(album => album.id === albumId);
    if (selectedAlbum) {
      localStorage.setItem("selectedAlbum", JSON.stringify(selectedAlbum));
    }
  };

  const handleIdentificacaoSubmit = (data: { nome: string; sobrenome: string; telefone: string }) => {
    localStorage.setItem('cliente_info', JSON.stringify(data));
    setClienteIdentificado(true);
    toast.success(`Bem-vindo(a), ${data.nome}!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!clienteIdentificado) {
    return <IdentificacaoCliente onSubmit={handleIdentificacaoSubmit} />;
  }

  return (
    <PublicPageLayout
      title="Escolha a linha de álbum para o seu projeto"
      currentStep={1}
      nextPath="/site/tamanho"
      hasSelection={!!selectedAlbumId}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {prices.map((album) => (
          <SelectionCard
            key={album.id}
            id={album.id}
            title={album.title}
            price={album.price || 0}
            image={album.image_urls?.[0] || "/placeholder.svg"}
            images={album.image_urls || []}
            isSelected={selectedAlbumId === album.id}
            onClick={() => handleSelectAlbum(album.id)}
          />
        ))}
      </div>
    </PublicPageLayout>
  );
} 