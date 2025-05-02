import React from "react";
import { useNavigate } from "react-router-dom";
import ProgressBar from "../navigation/ProgressBar";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminLoginModal } from "@/components/ui/AdminLoginModal";

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  currentStep: number;
  nextPath?: string;
  prevPath?: string;
  hasSelection?: boolean;
  nextButtonText?: string;
  showSkipButton?: boolean;
  skipPath?: string;
  skipButtonText?: string;
}

const PageLayout = ({
  children,
  title,
  currentStep,
  nextPath,
  prevPath,
  hasSelection = true,
  nextButtonText = "Próximo",
  showSkipButton = false,
  skipPath,
  skipButtonText = "Pular"
}: PageLayoutProps) => {
  const navigate = useNavigate();

  const handleNext = () => {
    if (nextPath) {
      navigate(nextPath);
    }
  };

  const handlePrev = () => {
    if (prevPath) {
      navigate(prevPath);
    }
  };

  const handleSkip = () => {
    if (skipPath) {
      navigate(skipPath);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17]">
      <AdminLoginModal />
      <header className="p-4 border-b border-muted">
        <ProgressBar currentStep={currentStep} />
      </header>
      <main className="flex-1 container max-w-7xl mx-auto py-8 px-4">
        <h1 className="text-2xl md:text-3xl font-semibold text-center mb-8">
          {title}
        </h1>
        <div className="mb-12">{children}</div>
        <div className="flex justify-between items-center mt-8">
          {prevPath ? (
            <Button
              variant="outline"
              onClick={handlePrev}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Voltar
            </Button>
          ) : (
            <div></div>
          )}
          <div className="flex gap-3">
            {showSkipButton && skipPath && (
              <Button 
                variant="destructive" 
                onClick={handleSkip}
                className="bg-album-highlight hover:bg-album-highlight/90"
              >
                {skipButtonText}
              </Button>
            )}
            {nextPath && (
              <Button
                variant="destructive"
                onClick={handleNext}
                disabled={!hasSelection}
                className="bg-red-700 hover:bg-red-800 flex items-center gap-2"
              >
                {nextButtonText}
                <ArrowRight size={16} />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PageLayout;
