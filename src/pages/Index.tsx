import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useAlbumPrices } from "@/hooks/useAlbumPrices";
import { Search } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import SelectionCard from "@/components/ui/SelectionCard";

export default function Index() {
  const navigate = useNavigate();
  const { prices, fetchPrices } = useAlbumPrices();
  const [loading, setLoading] = useState(true);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null); 

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchPrices();
      } catch (error) {
        console.error("Erro ao carregar preços:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchPrices]);

  // Recuperar seleção do localStorage
  useEffect(() => {
    const savedAlbumData = localStorage.getItem("selectedAlbum");
    if (savedAlbumData) {
      try {
        const parsedAlbum = JSON.parse(savedAlbumData);
        if (prices.some(p => p.id === parsedAlbum.id)) {
          setSelectedAlbumId(parsedAlbum.id);
        } else {
          localStorage.removeItem("selectedAlbum");
        }
      } catch (e) {
        console.error("Erro ao ler selectedAlbum do localStorage:", e);
        localStorage.removeItem("selectedAlbum");
      }
    }
  }, [prices]); 

  const handleSelectAlbum = (albumId: string) => {
    setSelectedAlbumId(albumId);
    const selectedAlbum = prices.find(album => album.id === albumId);
    if (selectedAlbum) {
      localStorage.setItem("selectedAlbum", JSON.stringify(selectedAlbum));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <PageLayout
      title="Escolha a linha de álbum para o seu projeto"
      currentStep={1}
      nextPath="/tamanho"
      prevPath="/photographer"
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
    </PageLayout>
  );
}
