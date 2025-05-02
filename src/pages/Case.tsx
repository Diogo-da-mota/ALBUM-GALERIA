import React, { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import SelectionCard from "@/components/ui/SelectionCard";
import { supabase } from "@/lib/supabase";

// Manter a constante como fallback caso a busca ao Supabase falhe
const FALLBACK_CASES = [
  {
    id: 1,
    title: "Estojo Standard",
    price: 150.00,
    image: "https://images.unsplash.com/photo-1545458094-c41fea38fdcb?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Estojo Premium",
    price: 250.00,
    image: "https://images.unsplash.com/photo-1603016868232-5e4eecaa5230?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Caixa Luxo",
    price: 350.00,
    image: "https://images.unsplash.com/photo-1633968352149-76be999c6822?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "Caixa Presente",
    price: 300.00,
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop"
  },
];

// Interface para os dados dos estojos vindos do Supabase
interface EstojoData {
  id: string;
  title: string;
  price: number;
  image_urls: string[] | null;
}

// Interface para o formato exibido na UI
interface CaseDisplay {
  id: string;
  title: string;
  price: number;
  image: string;
  images: string[];
}

const CasePage = () => {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [cases, setCases] = useState<CaseDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar os estojos do Supabase ao montar o componente
  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('estojos')
          .select('id, title, price, image_urls')
          .order('title');
          
        if (error) {
          console.error("Erro ao buscar estojos:", error);
          throw new Error("Não foi possível carregar os estojos. Tente novamente mais tarde.");
        }
        
        if (!data || data.length === 0) {
          console.warn("Nenhum estojo encontrado no Supabase. Usando dados de fallback.");
          // Usar os dados de fallback se não houver dados no Supabase
          setCases(FALLBACK_CASES.map(c => ({
            id: c.id.toString(),
            title: c.title,
            price: c.price,
            image: c.image,
            images: []
          })));
          return;
        }
        
        console.log("Dados de estojos carregados:", data);
        
        // Transformar os dados do Supabase para o formato esperado pela UI
        const displayCases: CaseDisplay[] = data.map((estojo: EstojoData) => ({
          id: estojo.id,
          title: estojo.title,
          price: estojo.price,
          // Manter a primeira imagem para compatibilidade com o componente SelectionCard
          image: estojo.image_urls && estojo.image_urls.length > 0 
            ? estojo.image_urls[0] 
            : "/placeholder-case.jpg", // Caminho para uma imagem padrão
          // Adicionar todas as imagens disponíveis
          images: estojo.image_urls || []
        }));
        
        setCases(displayCases);
        
        // Verificar se há um estojo salvo no localStorage
        const savedCase = localStorage.getItem("selectedCase");
        if (savedCase) {
          try {
            const parsedCase = JSON.parse(savedCase);
            // Verificar se o ID salvo ainda existe nos dados atuais
            if (displayCases.some(c => c.id === parsedCase.id)) {
              setSelectedCaseId(parsedCase.id);
            } else {
              localStorage.removeItem("selectedCase");
            }
          } catch (e) {
            console.error("Erro ao ler estojo do localStorage:", e);
            localStorage.removeItem("selectedCase");
          }
        }
        
      } catch (err: any) {
        console.error("Erro ao buscar estojos:", err);
        setError(err.message || "Erro ao carregar estojos");
        
        // Usar dados de fallback em caso de erro
        setCases(FALLBACK_CASES.map(c => ({
          id: c.id.toString(),
          title: c.title,
          price: c.price,
          image: c.image,
          images: []
        })));
      } finally {
        setLoading(false);
      }
    };
    
    fetchCases();
  }, []);

  const handleSelectCase = (id: string) => {
    setSelectedCaseId(id);
    // Salvar o estojo selecionado no localStorage
    const selectedCase = cases.find(caseItem => caseItem.id === id);
    if (selectedCase) {
      // Garantir que todas as imagens sejam salvas no localStorage
      localStorage.setItem("selectedCase", JSON.stringify({
        id: selectedCase.id,
        title: selectedCase.title,
        price: selectedCase.price,
        image: selectedCase.image,
        images: selectedCase.images
      }));
    }
  };

  return (
    <PageLayout
      title="Escolha um estojo para seu álbum ou pule esta etapa"
      currentStep={5}
      nextPath="/site/resumo"
      prevPath="/site/laminacao"
      hasSelection={true} // Always allow next since this step is optional
      showSkipButton={true}
      skipPath="/site/resumo"
      skipButtonText="Pular Estojo"
    >
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-400">Carregando estojos...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500 bg-opacity-10 p-4 rounded-md mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cases.map((caseItem) => (
            <SelectionCard
              key={caseItem.id}
              id={caseItem.id}
              title={caseItem.title}
              price={caseItem.price}
              image={caseItem.image}
              images={caseItem.images}
              isSelected={selectedCaseId === caseItem.id}
              onClick={() => handleSelectCase(caseItem.id)}
            />
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default CasePage;
