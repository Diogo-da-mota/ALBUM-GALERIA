import React, { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import RadioGroup from "@/components/ui/RadioGroup";

interface LaminacaoOption {
  id: string;
  label: string;
  price: number;
}

const LaminacaoPage = () => {
  const [selectedOption, setSelectedOption] = useState<string>("sem-laminacao");

  const options: LaminacaoOption[] = [
    { id: "sem-laminacao", label: "Sem Laminação", price: 0 },
  ];

  useEffect(() => {
    // Salvar a opção padrão no localStorage quando o componente montar
    const defaultOption = options.find(opt => opt.id === "sem-laminacao");
    if (defaultOption) {
      localStorage.setItem("selectedLamination", JSON.stringify(defaultOption));
    }
  }, []);

  const handleSelectOption = (id: string) => {
    setSelectedOption(id);
    const selectedLamination = options.find(opt => opt.id === id);
    if (selectedLamination) {
      localStorage.setItem("selectedLamination", JSON.stringify(selectedLamination));
    }
  };

  return (
    <PageLayout
      title="Escolha o acabamento do seu álbum"
      currentStep={4}
      nextPath="/site/estojo"
      prevPath="/site/paginas"
      hasSelection={!!selectedOption}
    >
      <div className="max-w-2xl mx-auto">
        <RadioGroup
          title="Tipo de papel"
          options={[{ id: "silk", label: "Papel Silk" }]}
          selectedId="silk"
          onChange={() => {}}
        />

        <RadioGroup
          title="Tipo de laminação"
          options={options}
          selectedId={selectedOption}
          onChange={handleSelectOption}
        />
      </div>
    </PageLayout>
  );
};

export default LaminacaoPage; 