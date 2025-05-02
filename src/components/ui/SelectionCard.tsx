import React, { useState, useEffect } from "react";
import { CircleDollarSign, Search, ChevronLeft, ChevronRight, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SelectionCardProps {
  id: string | number;
  title: string;
  price: number;
  subtitle?: string;
  image?: string;
  images?: string[];
  isSelected: boolean;
  onClick: () => void;
  className?: string;
  onDeleteImage?: (imageUrl: string) => Promise<void>;
  onSetMainImage?: (imageUrl: string) => Promise<void>;
}

const SelectionCard: React.FC<SelectionCardProps> = ({
  id,
  title,
  price,
  subtitle,
  image,
  images = [],
  isSelected,
  onClick,
  className,
  onDeleteImage,
  onSetMainImage,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Combinar a propriedade image com o array images
  const allImages = React.useMemo(() => {
    const uniqueImages = new Set<string>();
    
    // Adicionar a imagem principal, se existir
    if (image) uniqueImages.add(image);
    
    // Adicionar as imagens adicionais
    if (images && images.length > 0) {
      images.forEach(img => uniqueImages.add(img));
    }
    
    return Array.from(uniqueImages);
  }, [image, images]);
  
  // Resetar o índice da imagem quando as imagens mudam
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [allImages]);
  
  // Determinar cor com base na orientação
  const getSubtitleColor = () => {
    if (!subtitle) return "text-purple-300";
    
    switch (subtitle.toLowerCase()) {
      case "horizontal":
        return "text-blue-300";
      case "vertical":
        return "text-green-300";
      case "quadrado":
        return "text-purple-300";
      default:
        return "text-album-text-muted";
    }
  };
  
  // Funções para navegação do carrossel
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Impedir que o clique se propague para o card
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };
  
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Impedir que o clique se propague para o card
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Função para confirmar exclusão
  const handleDeleteClick = (e: React.MouseEvent, imageUrl: string) => {
    e.stopPropagation(); // Impedir que o clique se propague para o card
    setImageToDelete(imageUrl);
    setDeleteDialogOpen(true);
  };

  // Função para executar a exclusão
  const confirmDelete = async () => {
    if (!imageToDelete || !onDeleteImage) return;
    
    try {
      setIsDeleting(true);
      await onDeleteImage(imageToDelete);
    } catch (error) {
      console.error("Erro ao excluir imagem:", error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setImageToDelete(null);
    }
  };

  // Função para definir imagem principal
  const handleSetMainImage = (e: React.MouseEvent, imageUrl: string) => {
    e.stopPropagation(); // Impedir que o clique se propague para o card
    if (onSetMainImage) {
      onSetMainImage(imageUrl);
    }
  };

  return (
    <>
      <div
        className={cn(
          "bg-[#1A1F2E] rounded-lg p-6 cursor-pointer transition-all relative",
          "border border-gray-800 hover:border-red-500 hover:opacity-90",
          isSelected ? "border-2 border-red-500 shadow-lg shadow-red-500/20" : "",
          className
        )}
        onClick={onClick}
      >
        {/* Search icon in top right corner */}
        <div className="absolute top-4 right-4 z-10">
          <Search size={18} className="text-gray-400" />
        </div>

        {/* Image carousel (if images provided) */}
        {allImages.length > 0 && (
          <div className="mb-4 aspect-[4/3] overflow-hidden rounded-md relative group">
            <img
              src={allImages[currentImageIndex]}
              alt={`${title} - imagem ${currentImageIndex + 1}`}
              className="w-full h-full object-cover transition-opacity"
            />
            
            {/* Ações de imagem - estrela e lixeira */}
            {(onDeleteImage || onSetMainImage) && (
              <div className="absolute top-2 right-10 p-1 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                {onSetMainImage && (
                  <button 
                    onClick={(e) => handleSetMainImage(e, allImages[currentImageIndex])}
                    className="p-1 rounded-full"
                    aria-label="Definir como imagem principal"
                  >
                    <Star size={18} className="text-yellow-300" />
                  </button>
                )}
                {onDeleteImage && (
                  <button 
                    onClick={(e) => handleDeleteClick(e, allImages[currentImageIndex])}
                    className="p-1 rounded-full"
                    aria-label="Excluir imagem"
                    disabled={isDeleting}
                  >
                    <Trash2 size={18} className={`text-red-500 ${isDeleting ? 'animate-pulse' : ''}`} />
                  </button>
                )}
              </div>
            )}
            
            {/* Indicadores de navegação (apenas se houver mais de uma imagem) */}
            {allImages.length > 1 && (
              <>
                {/* Navegação esquerda/direita - estilo atualizado com botões maiores e sempre visíveis */}
                <button 
                  onClick={prevImage}
                  className="absolute left-0 top-1/4 bottom-1/4 flex items-center justify-center w-8 bg-transparent transition-opacity z-10"
                  aria-label="Imagem anterior"
                >
                  <ChevronLeft size={24} className="text-white" />
                </button>
                
                <button 
                  onClick={nextImage}
                  className="absolute right-0 top-1/4 bottom-1/4 flex items-center justify-center w-8 bg-transparent transition-opacity z-10"
                  aria-label="Próxima imagem"
                >
                  <ChevronRight size={24} className="text-white" />
                </button>
                
                {/* Indicadores de posição - escondidos para dar mais destaque às setas */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1 opacity-60">
                  {allImages.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentImageIndex 
                          ? 'w-4 bg-white' 
                          : 'w-1.5 bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Title with larger font */}
        <h3 className="font-medium text-2xl mb-1 text-white">{title}</h3>

        {/* Orientation subtitle with color based on type */}
        {subtitle && (
          <p className={cn("text-sm mb-4", getSubtitleColor())}>
            {subtitle}
          </p>
        )}

        {/* Price at bottom with currency icon */}
        {price > 0 && (
          <div className="flex items-center gap-1 text-yellow-400">
            <CircleDollarSign size={16} className="text-yellow-400" />
            <span className="text-sm font-medium">R$ {price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        )}
      </div>

      {/* Diálogo de confirmação para excluir imagem */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir esta imagem? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Não</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Excluindo..." : "Sim"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SelectionCard;
