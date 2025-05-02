import React from "react";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProgressBarProps {
  currentStep: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
  const navigate = useNavigate();
  
  const steps = [
    { id: 1, name: "álbum", path: "/site" },
    { id: 2, name: "tamanho", path: "/site/tamanho" },
    { id: 3, name: "páginas", path: "/site/paginas" },
    { id: 4, name: "laminação", path: "/site/laminacao" },
    { id: 5, name: "estojo", path: "/site/estojo" },
    { id: 6, name: "pedido", path: "/site/pedido" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step) => (
          <div 
            key={step.id} 
            className="flex flex-col items-center cursor-pointer group"
            onClick={() => navigate(step.path)}
          >
            <div 
              className={`flex items-center justify-center w-8 h-8 rounded-full mb-2 transition-colors
                ${step.id < currentStep
                  ? "bg-green-500"
                  : step.id === currentStep
                  ? "bg-yellow-500"
                  : "bg-gray-700 group-hover:bg-green-500/50"
                }
              `}
            >
              {step.id < currentStep ? (
                <Check size={16} className="text-white" />
              ) : (
                <span className="text-xs font-medium text-white">
                  {step.id}
                </span>
              )}
            </div>
            <span
              className={`text-sm whitespace-nowrap transition-colors
                ${step.id < currentStep
                  ? "text-green-500"
                  : step.id === currentStep
                  ? "text-yellow-500"
                  : "text-gray-500 group-hover:text-green-500/50"
                }
              `}
            >
              {step.name}
            </span>
          </div>
        ))}
      </div>

      {/* Mobile version */}
      <div className="md:hidden flex items-center justify-between">
        <span className="text-sm font-medium">
          Etapa {currentStep} de {steps.length}
        </span>
        <div className="w-2/3 bg-gray-700 rounded-full h-2.5">
          <div
            className="h-2.5 rounded-full bg-green-500"
            style={{
              width: `${(Math.min(currentStep, steps.length) / steps.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
