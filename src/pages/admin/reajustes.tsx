import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import toast from "@/components/ui/sonner";
import { useAlbumPrices } from "@/hooks/useAlbumPrices";

interface AlbumAdjustment {
  baseAdjustment: string;
  pageAdjustment: string;
}

export const AdminReajustes = () => {
  const { 
    prices, 
    updateValorBase, 
    updateReajusteBase,
    updateReajusteLamina,
    fetchPrices
  } = useAlbumPrices();
  
  const [adjustments, setAdjustments] = useState<Record<string, AlbumAdjustment>>({});
  const [loading, setLoading] = useState(true);
  const [editingPrices, setEditingPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchPrices();
      } catch (error) {
        console.error("Erro ao carregar dados do painel:", error);
        toast.error("Falha ao carregar dados do painel.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchPrices]);

  useEffect(() => {
    const initialEditingPrices: Record<string, number> = {};
    prices.forEach(album => {
      initialEditingPrices[album.id] = album.price || 0;
    });
    setEditingPrices(initialEditingPrices);
  }, [prices]);

  useEffect(() => {
    const initialAdjustments: Record<string, AlbumAdjustment> = {};
    prices.forEach(album => {
      initialAdjustments[album.id] = { 
        baseAdjustment: album.reajuste_base?.toString() || "0",
        pageAdjustment: album.reajuste_lamina?.toString() || "0"
      };
    });
    setAdjustments(initialAdjustments);
  }, [prices]);

  const handlePriceChange = (id: string, newPrice: string) => {
    const parsedPrice = parseFloat(newPrice);
    if (!isNaN(parsedPrice)) {
      setEditingPrices(prev => ({
        ...prev,
        [id]: parsedPrice
      }));
    }
  };

  const handleSalvarValorBase = async (id: string) => {
    const newPrice = editingPrices[id];
    if (isNaN(newPrice)) return;
    
    const currentPrice = prices.find(album => album.id === id)?.price || 0;
    if (Math.abs(currentPrice - newPrice) < 0.01) return;

    try {
      await updateValorBase(id, newPrice);
      toast.success("Valor base atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar valor base");
    }
  };

  const handleAplicarReajuste = async (album: typeof prices[0]) => {
    const adjustment = adjustments[album.id];
    if (!adjustment) return;

    const rawBaseValue = adjustment.baseAdjustment;
    if (rawBaseValue.trim() === "") {
      toast.warning("O campo Reajuste Base não pode estar vazio.");
      return;
    }
    const baseAdjustmentPercent = parseFloat(rawBaseValue);
    if (isNaN(baseAdjustmentPercent)) {
      toast.warning("Valor de reajuste base inválido. Insira apenas números.");
      return;
    }

    const rawPageValue = adjustment.pageAdjustment;
    if (rawPageValue.trim() === "") {
      toast.warning("O campo Reajuste Lâmina não pode estar vazio.");
      return;
    }
    const pageAdjustmentPercent = parseFloat(rawPageValue);
    if (isNaN(pageAdjustmentPercent)) {
      toast.warning("Valor de reajuste de lâmina inválido. Insira apenas números.");
      return;
    }

    let baseUpdated = false;
    let laminaUpdated = false;

    try {
      if (album.reajuste_base !== baseAdjustmentPercent) {
        await updateReajusteBase(album.id, baseAdjustmentPercent);
        baseUpdated = true;
      }
      
      if (album.reajuste_lamina !== pageAdjustmentPercent) {
        await updateReajusteLamina(album.id, pageAdjustmentPercent);
        laminaUpdated = true;
      }

      if (baseUpdated || laminaUpdated) {
        setAdjustments(prev => ({
          ...prev,
          [album.id]: {
            baseAdjustment: baseAdjustmentPercent.toString(),
            pageAdjustment: pageAdjustmentPercent.toString()
          }
        }));
        
        let successMessages: string[] = [];
        if (baseUpdated) successMessages.push("Reajuste base");
        if (laminaUpdated) successMessages.push("Reajuste lâmina");
        toast.success(`${successMessages.join(' e ')} atualizado(s) com sucesso!`);
      } else {
        toast.info("Nenhum reajuste foi alterado.");
      }
    } catch (error) {
      console.error("Erro ao atualizar reajustes:", error);
      toast.error(`Erro ao aplicar reajustes: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    }
  };

  const handleZerarReajuste = async (albumId: string) => {
    try {
      await updateReajusteBase(albumId, 0);
      await updateReajusteLamina(albumId, 0);
      
      setAdjustments(prev => ({
        ...prev,
        [albumId]: { baseAdjustment: "0", pageAdjustment: "0" }
      }));
      
      toast.success("Reajuste zerado com sucesso!");
    } catch (error) {
      console.error("Erro ao zerar reajustes:", error);
      toast.error("Erro ao zerar reajuste");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><p>Carregando dados...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Painel de Reajuste de Preços</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prices.map((album) => (
          <Card key={album.id} className="p-6 bg-[#1A1F2E] border-gray-800">
            <h2 className="text-xl font-semibold mb-6 text-white">{album.title}</h2>
            
            <div className="space-y-6">
              <div>
                <label className="text-sm text-gray-400 block mb-2">Valor base mensal (R$)</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={editingPrices[album.id] || 0}
                    onChange={(e) => handlePriceChange(album.id, e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSalvarValorBase(album.id)}
                    onBlur={() => handleSalvarValorBase(album.id)}
                    className="bg-gray-800 border-gray-700 w-full text-white"
                  />
                  <Button 
                    onClick={() => handleSalvarValorBase(album.id)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Salvar
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Reajuste Base (%)</label>
                  <Input
                    type="number"
                    value={adjustments[album.id]?.baseAdjustment || "0"}
                    onChange={(e) => setAdjustments(prev => {
                      const currentAdjustment = prev[album.id] || { baseAdjustment: "0", pageAdjustment: "0" };
                      return {
                        ...prev,
                        [album.id]: { 
                          ...currentAdjustment,
                          baseAdjustment: e.target.value 
                        }
                      };
                    })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Reajuste Lâmina (%)</label>
                  <Input
                    type="number"
                    value={adjustments[album.id]?.pageAdjustment || "0"}
                    onChange={(e) => setAdjustments(prev => {
                      const currentAdjustment = prev[album.id] || { baseAdjustment: "0", pageAdjustment: "0" };
                      return {
                        ...prev,
                        [album.id]: { 
                          ...currentAdjustment,
                          pageAdjustment: e.target.value 
                        }
                      };
                    })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={() => handleAplicarReajuste(album)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Aplicar Reajuste
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleZerarReajuste(album.id)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  Zerar Reajuste
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}; 