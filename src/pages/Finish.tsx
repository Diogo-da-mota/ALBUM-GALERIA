import React, { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import RadioGroup from "@/components/ui/RadioGroup";

const PAPER_OPTIONS = [
  { id: "silk", label: "Papel Silk" }
];

const LAMINATION_OPTIONS = [
  { id: "none", label: "Sem Laminação", price: 0.00 }
];

const FinishPage = () => {
  const [selectedPaper, setSelectedPaper] = useState<string | null>("silk");
  const [selectedLamination, setSelectedLamination] = useState<string | null>("none");

  const handleSelectPaper = (id: string | number) => {
    setSelectedPaper(id as string);
    // In a real app, we would save this to global state or localStorage
    localStorage.setItem("selectedPaper", JSON.stringify(PAPER_OPTIONS.find(option => option.id === id)));
  };

  const handleSelectLamination = (id: string | number) => {
    setSelectedLamination(id as string);
    // In a real app, we would save this to global state or localStorage
    localStorage.setItem("selectedLamination", JSON.stringify(LAMINATION_OPTIONS.find(option => option.id === id)));
  };

  return (
    <PageLayout
      title="Escolha o acabamento do seu álbum"
      currentStep={4}
      nextPath="/site/estojo"
      prevPath="/site/paginas"
      hasSelection={!!selectedPaper && !!selectedLamination}
    >
      <div className="max-w-2xl mx-auto">
        <RadioGroup
          title="Tipo de papel"
          options={PAPER_OPTIONS}
          selectedId={selectedPaper}
          onChange={handleSelectPaper}
        />

        <RadioGroup
          title="Tipo de laminação"
          options={LAMINATION_OPTIONS}
          selectedId={selectedLamination}
          onChange={handleSelectLamination}
        />
      </div>
    </PageLayout>
  );
};

export default FinishPage;
