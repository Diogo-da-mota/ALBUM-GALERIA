import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  currentStep: number;
  nextPath?: string;
  prevPath?: string;
  hasSelection?: boolean;
}

const steps = [
  { id: 1, name: "álbum", path: "/site" },
  { id: 2, name: "tamanho", path: "/site/tamanho" },
  { id: 3, name: "páginas", path: "/site/paginas" },
  { id: 4, name: "laminação", path: "/site/laminacao" },
  { id: 5, name: "estojo", path: "/site/estojo" },
  { id: 6, name: "pedido", path: "/site/pedido" },
];

export default function PublicPageLayout({
  children,
  title,
  currentStep,
  nextPath,
  prevPath,
  hasSelection = true,
}: PageLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white">
      {/* Progress Steps */}
      <div className="bg-[#1A1F2E] py-4 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  step.id === currentStep
                    ? "text-white"
                    : step.id < currentStep
                    ? "text-green-500"
                    : "text-gray-500"
                }`}
                onClick={() => navigate(step.path)}
                style={{ cursor: "pointer" }}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-1
                    ${
                      step.id === currentStep
                        ? "bg-yellow-500"
                        : step.id < currentStep
                        ? "bg-green-500"
                        : "bg-gray-700"
                    }`}
                >
                  {step.id < currentStep ? (
                    "✓"
                  ) : (
                    <span className="text-white">{step.id}</span>
                  )}
                </div>
                <span className="text-sm">{step.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">{title}</h1>

        {/* Content */}
        <div className="mb-8">{children}</div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-12">
          {prevPath && (
            <Button
              variant="outline"
              onClick={() => navigate(prevPath)}
              className="bg-transparent border-gray-600 text-white hover:bg-gray-800"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          )}

          {nextPath && (
            <Button
              onClick={() => navigate(nextPath)}
              disabled={!hasSelection}
              className={`ml-auto bg-blue-600 hover:bg-blue-700 ${
                !hasSelection && "opacity-50 cursor-not-allowed"
              }`}
            >
              Próximo
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 