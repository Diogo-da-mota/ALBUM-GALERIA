import React, { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import SelectionCard from "@/components/ui/SelectionCard";
import { SIZE_PROPORTIONS, BASE_SHEET_PRICES, calculateSizePrice } from "@/utils/priceCalculator";

// Definir os tamanhos disponíveis com suas orientações
const SIZES = [
  {
    id: 1,
    title: "10x15",
    subtitle: "Horizontal"
  },
  {
    id: 2,
    title: "15x10",
    subtitle: "Vertical"
  },
  {
    id: 3,
    title: "15x15",
    subtitle: "Quadrado"
  },
  {
    id: 4,
    title: "15x20",
    subtitle: "Horizontal"
  },
  {
    id: 5,
    title: "20x15",
    subtitle: "Vertical"
  },
  {
    id: 6,
    title: "20x20",
    subtitle: "Quadrado"
  },
  {
    id: 7,
    title: "20x25",
    subtitle: "Horizontal"
  },
  {
    id: 8,
    title: "25x20",
    subtitle: "Vertical"
  },
  {
    id: 9,
    title: "25x25",
    subtitle: "Quadrado"
  },
  {
    id: 10,
    title: "20x30",
    subtitle: "Horizontal"
  },
  {
    id: 11,
    title: "30x20",
    subtitle: "Vertical"
  },
  {
    id: 12,
    title: "25x30",
    subtitle: "Horizontal"
  },
  {
    id: 13,
    title: "30x25",
    subtitle: "Vertical"
  },
  {
    id: 14,
    title: "30x30",
    subtitle: "Quadrado"
  },
  {
    id: 15,
    title: "30x35",
    subtitle: "Horizontal"
  },
  {
    id: 16,
    title: "30x40",
    subtitle: "Horizontal"
  },
  {
    id: 17,
    title: "30x45",
    subtitle: "Horizontal"
  },
  {
    id: 18,
    title: "35x30",
    subtitle: "Vertical"
  },
  {
    id: 19,
    title: "35x35",
    subtitle: "Quadrado"
  },
  {
    id: 20,
    title: "40x30",
    subtitle: "Vertical"
  },
  {
    id: 21,
    title: "40x40",
    subtitle: "Quadrado"
  },
  {
    id: 22,
    title: "45x30",
    subtitle: "Vertical"
  }
];

// Interface para álbum salvo no localStorage
interface SavedAlbum {
  id: string;
  title: string;
  price: number;
  reajuste_base: number;
  reajuste_lamina: number;
}

const SizePage = () => {
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
  const [sizeWithPrices, setSizeWithPrices] = useState<Array<any>>([]);
  const [albumModel, setAlbumModel] = useState<string>("");

  // Carregar o modelo de álbum selecionado e calcular preços
  useEffect(() => {
    const savedAlbumData = localStorage.getItem("selectedAlbum");
    if (savedAlbumData) {
      try {
        const parsedAlbum: SavedAlbum = JSON.parse(savedAlbumData);
        
        // Extrair dados necessários do álbum salvo
        const basePrice = parsedAlbum.price; // Este é o valor base original
        const albumReajusteBase = Number(parsedAlbum.reajuste_base || 0);
        const albumReajusteLamina = Number(parsedAlbum.reajuste_lamina || 0); // Guardar para próxima etapa
        const albumTitle = parsedAlbum.title;
        
        setAlbumModel(albumTitle); // Atualizar o título para exibição

        console.log(`Dados do localStorage para ${albumTitle}: Base=R$${basePrice}, ReajusteBase=${albumReajusteBase}%, ReajusteLâmina=${albumReajusteLamina}%`);

        // Calcular os preços para cada tamanho diretamente aqui
        const sizesWithCalculatedPrices = SIZES.map(size => {
          const proporcao = SIZE_PROPORTIONS[size.title as keyof typeof SIZE_PROPORTIONS] || 1;
          
          // Aplicar lógica condicional para o preço final
          const precoFinal = 
            (size.title === "10x15" || size.title === "15x10")
              ? basePrice // <- Usa apenas o valor base para 10x15 e 15x10
              : (basePrice * proporcao) * (1 + albumReajusteBase / 100); // <- Aplica reajuste para os demais

          const sheetPrice = BASE_SHEET_PRICES[size.title as keyof typeof BASE_SHEET_PRICES] || 0;

          return {
            ...size,
            price: Number(precoFinal.toFixed(2)), // Usar o preço final calculado
            sheetPrice: sheetPrice, // Manter para a próxima etapa
            // Passar os reajustes para serem salvos ao selecionar o tamanho
            reajuste_base: albumReajusteBase,
            reajuste_lamina: albumReajusteLamina 
          };
        });

        setSizeWithPrices(sizesWithCalculatedPrices);

      } catch (e) {
        console.error("Erro ao processar dados do álbum do localStorage:", e);
        setSizeWithPrices(SIZES.map(size => ({ ...size, price: 0 }))); // Fallback
      }
    } else {
      console.warn("Nenhum álbum selecionado encontrado no localStorage. Redirecionando...");
      window.location.href = '/site'; // Redirecionar para a seleção de álbum
    }
  }, []); // Executar apenas uma vez na montagem

  // Verificar se há um tamanho previamente selecionado
  useEffect(() => {
    const savedSize = localStorage.getItem("selectedSize");
    if (savedSize) {
      try {
        const parsedSize = JSON.parse(savedSize);
        setSelectedSizeId(parsedSize.id);
      } catch (e) {
        setSelectedSizeId(null);
      }
    }
  }, []);

  const handleSelectSize = (id: number) => {
    setSelectedSizeId(id);
    const selectedSizeData = sizeWithPrices.find(size => size.id === id);
    if (selectedSizeData) {
      // Salvar os dados completos do tamanho, incluindo os reajustes que vieram do álbum
      localStorage.setItem("selectedSize", JSON.stringify(selectedSizeData));
      console.log("Tamanho selecionado e salvo no localStorage:", selectedSizeData);
    }
  };

  return (
    <PageLayout
      title="Selecione o tamanho"
      currentStep={2}
      nextPath="/site/paginas"
      prevPath="/site"
      hasSelection={!!selectedSizeId}
    >
      {/* Mostrar qual álbum foi selecionado para melhor UX */}
      <div className="mb-4 text-center">
        <h2 className="text-lg font-semibold">
          Álbum selecionado: <span className="font-bold text-blue-500">{albumModel}</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sizeWithPrices.map((size) => (
          <SelectionCard
            key={size.id}
            id={size.id}
            title={size.title}
            subtitle={size.subtitle}
            price={size.price || 0}
            isSelected={selectedSizeId === size.id}
            onClick={() => handleSelectSize(size.id)}
          />
        ))}
      </div>
    </PageLayout>
  );
};

export default SizePage;
