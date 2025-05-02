import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Phone, User, FileText, Loader2, MessageSquare } from "lucide-react";
import jsPDF from 'jspdf';
import { useToast } from "@/components/ui/use-toast";

interface PedidoCardProps {
  id: string;
  imageUrl: string;
  nome: string;
  sobrenome: string;
  telefone: string;
  createdAt?: string;
}

export function PedidoCard({ 
  id, 
  imageUrl, 
  nome, 
  sobrenome, 
  telefone,
  createdAt,
}: PedidoCardProps) {

  const { toast } = useToast();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const nomeCompleto = `${nome || 'Cliente'} ${sobrenome || ''}`.trim();
  
  const dataFormatada = createdAt 
    ? new Date(createdAt).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }) 
    : 'Data não disponível';

  const telefoneLimpo = telefone ? telefone.replace(/\D/g, '') : '';
  const whatsappLink = telefoneLimpo ? (
    telefoneLimpo.startsWith('55') 
      ? `https://wa.me/${telefoneLimpo}` 
      : `https://wa.me/55${telefoneLimpo}`
  ) : null;
  
  console.log(`PedidoCard ID: ${id}, Telefone: ${telefone}, Link WA: ${whatsappLink}`);

  const handleGeneratePdfAndOpenWhatsApp = async () => {
    if (!imageUrl) {
      toast({ title: "Erro", description: "URL da imagem do pedido não encontrada.", variant: "destructive" });
      return;
    }
    
    setIsGeneratingPdf(true);
    toast({ title: "Gerando PDF...", description: "Aguarde enquanto baixamos a imagem.", variant: "default" });

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Falha ao baixar imagem: ${response.statusText}`);
      }
      const imageBlob = await response.blob();

      const imageDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageBlob);
      });

      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      doc.addImage(imageDataUrl, 'PNG', margin, margin, pdfWidth - (margin * 2), 0); 

      const filename = `pedido-${nomeCompleto.replace(/\s+/g, '_')}-${id.substring(0, 4)}.pdf`;
      doc.save(filename);
      console.log("PDF gerado e salvo:", filename);
      toast({ title: "PDF Gerado!", description: "O download foi iniciado.", variant: "default" });

      if (whatsappLink) {
        console.log("Abrindo WhatsApp...");
        try {
          const whatsappWindow = window.open(whatsappLink, '_blank');
          if (!whatsappWindow) {
            console.warn("Pop-up do WhatsApp bloqueado pelo navegador");
            toast({ 
              title: "WhatsApp Bloqueado", 
              description: "O navegador bloqueou a abertura do WhatsApp. Por favor, permita pop-ups para este site.", 
              variant: "default", 
              duration: 7000 
            });
          }
        } catch (error) {
          console.error("Erro ao abrir WhatsApp:", error);
          toast({ 
            title: "Erro", 
            description: "Não foi possível abrir o WhatsApp. Tente novamente.", 
            variant: "destructive" 
          });
        }
      } else {
        console.log("Nenhum link do WhatsApp para abrir.");
      }

    } catch (error: any) {
      console.error("Erro ao gerar PDF ou abrir WhatsApp:", error);
      toast({ title: "Erro", description: `Falha no processo: ${error.message}`, variant: "destructive" });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <Card key={id} className="bg-[#1A1F2E] border-gray-800 text-white flex flex-col overflow-hidden">
      <CardHeader className="p-4">
        <CardTitle className="text-lg truncate" title={nomeCompleto}>
           <User className="inline mr-2 h-4 w-4 align-[-2px] text-gray-400" />
           {nomeCompleto}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-grow">
        {imageUrl ? (
          <a href={imageUrl} target="_blank" rel="noopener noreferrer" title="Ver imagem em tamanho real">
            <img 
              src={imageUrl} 
              alt={`Pedido de ${nomeCompleto}`} 
              className="w-full h-48 object-cover object-top hover:opacity-90 transition-opacity"
            />
          </a>
        ) : (
          <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
            <span className="text-gray-500 text-sm">Imagem não disponível</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 flex flex-col items-start space-y-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center text-sm text-gray-400">
            <Phone className="mr-2 h-4 w-4 flex-shrink-0" />
            <span>{telefone || 'Telefone não informado'}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            {whatsappLink && (
                <a 
                  href={whatsappLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  title="Abrir no WhatsApp"
                  className="text-green-500 hover:text-green-400 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MessageSquare className="h-5 w-5" /> 
                </a>
             )}
            <button 
              onClick={handleGeneratePdfAndOpenWhatsApp} 
              disabled={isGeneratingPdf || !imageUrl}
              title={imageUrl ? "Gerar PDF do Pedido e Abrir WhatsApp" : "Imagem do pedido não disponível"}
              className={`transition-colors ${!imageUrl || isGeneratingPdf ? 'text-gray-600 cursor-not-allowed' : 'text-red-500 hover:text-red-400'}`}
            >
              {isGeneratingPdf ? (
                <Loader2 className="h-5 w-5 animate-spin" /> 
              ) : (
                <FileText className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        <div className="text-xs text-gray-500 w-full text-right">
          {dataFormatada}
        </div>
      </CardFooter>
    </Card>
  );
} 