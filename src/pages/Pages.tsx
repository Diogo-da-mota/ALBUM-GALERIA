import React, { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import SelectionCard from "@/components/ui/SelectionCard";
import { calculateSheetPrice } from "@/utils/priceCalculator";

interface SavedSize {
  title: string;
  price: number;
  sheetPrice: number;
  reajuste_base: number;
  reajuste_lamina: number;
}

const PagesPage = () => {
  const [selectedPageOption, setSelectedPageOption] = useState<number | null>(null);
  const [pageOptions, setPageOptions] = useState<Array<any>>([]);
  const [basePrice, setBasePrice] = useState(0);
  const [reajusteLamina, setReajusteLamina] = useState(0);

  // Função para gerar opções de páginas com preços
  const generatePageOptions = (size: string, basePrice: number, reajusteLamina: number) => {
    // Log para depuração: Verificar o reajuste recebido pela função
    console.log(`🔍 [Pages.tsx generatePageOptions] Recebido: Tamanho=${size}, BasePrice=${basePrice}, ReajusteLamina=${reajusteLamina}%`);
    
    const options = [];
    let id = 1;
    
    for (let pages = 30; pages <= 100; pages += 2) {
      const sheets = pages / 2;
      const extraSheets = sheets - 15; // 15 lâminas é o padrão incluído no preço base
      
      // Log para depuração: Verificar o reajuste usado antes de chamar calculateSheetPrice
      console.log(`  -> Calculando para ${pages} páginas: ExtraSheets=${extraSheets}, Usando ReajusteLamina=${reajusteLamina}%`);

      // Calcular o preço das lâminas extras com reajuste
      const extraSheetsPrice = extraSheets > 0 
        ? calculateSheetPrice(size, extraSheets, reajusteLamina)
        : 0;
      
      // Preço total é o preço base mais o custo das lâminas extras
      const totalPrice = Number((basePrice + extraSheetsPrice).toFixed(2));
      
      options.push({
        id,
        pages,
        sheets,
        extraSheetsPrice,
        totalPrice
      });
      
      id++;
    }
    
    return options;
  };

  useEffect(() => {
    // Carregar tamanho selecionado e seu preço
    const savedSize = localStorage.getItem("selectedSize");
    if (savedSize) {
      try {
        const parsedSize: SavedSize = JSON.parse(savedSize);
        const sizeTitle = parsedSize.title;
        
        setBasePrice(parsedSize.price || 0);
        setReajusteLamina(parsedSize.reajuste_lamina || 0);
        
        console.log(`Carregando dados: Tamanho ${sizeTitle}, Preço Base: R$ ${parsedSize.price}, Reajuste Lâmina: ${parsedSize.reajuste_lamina}%`);
        
        // Gerar opções de páginas com preços ajustados
        const options = generatePageOptions(
          sizeTitle,
          parsedSize.price || 0,
          parsedSize.reajuste_lamina || 0
        );
        
        setPageOptions(options);
      } catch (e) {
        console.error("Erro ao carregar dados do tamanho:", e);
      }
    }
  }, []);

  const handleSelectOption = (id: number) => {
    setSelectedPageOption(id);
    const selectedOption = pageOptions.find(option => option.id === id);
    if (selectedOption) {
      // Salvar a opção selecionada com todos os preços e reajustes
      localStorage.setItem("selectedPages", JSON.stringify({
        ...selectedOption,
        basePrice: basePrice,
        reajuste_lamina: reajusteLamina
      }));
    }
  };

  return (
    <PageLayout
      title="Selecione a quantidade de páginas"
      currentStep={3}
      nextPath="/site/laminacao"
      prevPath="/site/tamanho"
      hasSelection={!!selectedPageOption}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {pageOptions.map((option) => (
          <SelectionCard
            key={option.id}
            id={option.id}
            title={`${option.pages} páginas (${option.sheets} lâminas)`}
            price={option.totalPrice}
            isSelected={selectedPageOption === option.id}
            onClick={() => handleSelectOption(option.id)}
            className="p-4"
          />
        ))}
      </div>
    </PageLayout>
  );
};

export default PagesPage;
