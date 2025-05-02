import React, { useEffect, useRef, useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Check, Share2, Loader2, Image } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import html2canvas from "html2canvas";
import { v4 as uuidv4 } from 'uuid';

interface OrderSummary {
  album: {
    title: string;
    price: number;
    reajuste_base: number;
    reajuste_lamina: number;
  };
  size: {
    title: string;
    price: number;
  };
  pages: {
    pages: number;
    sheets: number;
    extraSheetsPrice: number;
    totalPrice: number;
    basePrice: number;
  };
  paper: {
    label: string;
  };
  lamination: {
    label: string;
    price?: number;
  };
  case?: {
    label: string;
    price: number;
    title: string;
  };
}

const DEFAULT_ORDER: OrderSummary = {
  album: {
    title: "Luxo Total",
    price: 550.00,
    reajuste_base: 0,
    reajuste_lamina: 0
  },
  size: {
    title: "20x20",
    price: 259.83,
  },
  pages: {
    pages: 30,
    sheets: 15,
    extraSheetsPrice: 0,
    totalPrice: 0,
    basePrice: 0
  },
  paper: {
    label: "Papel Silk",
  },
  lamination: {
    label: "Sem Laminação",
  },
};

const SummaryPage = () => {
  const [order, setOrder] = useState<OrderSummary>(DEFAULT_ORDER);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const { toast } = useToast();
  const orderSummaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Carregar dados do localStorage
    try {
      const albumStr = localStorage.getItem("selectedAlbum");
      const sizeStr = localStorage.getItem("selectedSize");
      const pagesStr = localStorage.getItem("selectedPages");
      const paperStr = localStorage.getItem("selectedPaper");
      const laminationStr = localStorage.getItem("selectedLamination");
      const caseStr = localStorage.getItem("selectedCase");
      
      const loadedOrder = { ...DEFAULT_ORDER };
      
      if (albumStr) loadedOrder.album = JSON.parse(albumStr);
      if (sizeStr) loadedOrder.size = JSON.parse(sizeStr);
      if (pagesStr) loadedOrder.pages = JSON.parse(pagesStr);
      if (paperStr) loadedOrder.paper = JSON.parse(paperStr);
      if (laminationStr) loadedOrder.lamination = JSON.parse(laminationStr);
      if (caseStr) loadedOrder.case = JSON.parse(caseStr);
      
      setOrder(loadedOrder);
      
      // Calcular preço total
      const total = calculateTotalPrice(loadedOrder);
      setTotalPrice(total);
      
      console.log("Resumo do pedido:", {
        album: loadedOrder.album.title,
        valorBase: loadedOrder.album.price,
        reajusteBase: loadedOrder.album.reajuste_base,
        reajusteLamina: loadedOrder.album.reajuste_lamina,
        tamanho: loadedOrder.size.title,
        precoTamanho: loadedOrder.size.price,
        paginas: loadedOrder.pages.pages,
        precoLaminas: loadedOrder.pages.extraSheetsPrice,
        precoTotal: total
      });
      
    } catch (error) {
      console.error("Erro ao carregar pedido do localStorage:", error);
    }
  }, []);

  // Função para calcular o preço total do pedido
  const calculateTotalPrice = (order: OrderSummary): number => {
    const sizePrice = order.size.price || 0;
    const extraPagesPrice = order.pages.extraSheetsPrice || 0;
    const laminationPrice = order.lamination.price || 0;
    const casePrice = order.case?.price || 0;
    
    return Number((sizePrice + extraPagesPrice + laminationPrice + casePrice).toFixed(2));
  };

  const handleShare = async () => {
    if (!orderSummaryRef.current) {
      console.error("Summary.tsx: orderSummaryRef não está definido.");
      toast({ title: "Erro", description: "Referência do resumo não encontrada.", variant: "destructive" });
      return;
    }

    let imageUrl = ''; // Inicializa a URL da imagem fora do try para acesso posterior

    try {
      setIsGeneratingImage(true);
      console.log("Summary.tsx: Iniciando handleShare...");
      toast({ title: "Gerando imagem e salvando...", description: "Aguarde..." });

      // --- 1. Geração da Imagem ---
      if (orderSummaryRef.current) {
        orderSummaryRef.current.style.display = 'block';
        orderSummaryRef.current.style.position = 'fixed';
        orderSummaryRef.current.style.left = '-9999px';
        orderSummaryRef.current.style.top = '0';
      }
      await new Promise(resolve => setTimeout(resolve, 500)); // Delay para renderização

      console.log("Summary.tsx: Capturando canvas...");
      const canvas = await html2canvas(orderSummaryRef.current, {
          scale: 2, backgroundColor: "#111827", logging: false 
      });
      console.log("Summary.tsx: Canvas capturado.");

      if (orderSummaryRef.current) {
        orderSummaryRef.current.style.display = 'none';
      }

      console.log("Summary.tsx: Convertendo canvas para blob...");
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
             console.log("Summary.tsx: Blob criado.");
             resolve(blob);
          } else {
            console.error("Summary.tsx: Falha ao criar blob.");
            reject(new Error("Falha ao converter imagem para blob"));
          }
        }, "image/png", 0.95);
      });

      // --- 2. Verificação de Autenticação ---
      console.log("Summary.tsx: Verificando sessão..."); 
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Summary.tsx: Erro ao obter sessão:", sessionError);
        throw new Error("Falha ao verificar status de autenticação.");
      }
      if (!session?.user) { 
         console.error("Summary.tsx: Nenhuma sessão de usuário ativa encontrada.");
         toast({ title: "Autenticação Necessária", description: "Você precisa estar logado.", variant: "destructive" });
         throw new Error("Usuário não autenticado."); 
      }
      console.log("Summary.tsx: Sessão ativa encontrada para user_id:", session.user.id);

      // --- 3. Upload da Imagem --- 
      // REMOVIDO: Bloco de verificação/criação de bucket.
      // Assumimos que o bucket 'album-images' existe e está configurado corretamente.
      
      const fileName = `pedido-${uuidv4()}.png`;
      const filePath = `pedidos/${fileName}`;
      console.log(`Summary.tsx: Fazendo upload para Storage: ${filePath}`);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('album-images') // Nome do bucket
        .upload(filePath, blob, { contentType: 'image/png', upsert: true });

      if (uploadError) {
        console.error("Summary.tsx: Erro no upload:", uploadError);
        throw new Error(`Erro no upload da imagem: ${uploadError.message}`);
      }
      console.log("Summary.tsx: Upload concluído.");

      // --- 4. Obter URL Pública ---
      console.log("Summary.tsx: Obtendo URL pública...");
      const { data: urlData } = supabase.storage
        .from('album-images')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
         console.error("Summary.tsx: Não foi possível obter a URL pública após o upload.");
         throw new Error("Falha ao obter link da imagem gerada.");
      }
      imageUrl = urlData.publicUrl; // Atribui à variável fora do try
      console.log(`Summary.tsx: URL pública obtida: ${imageUrl}`);

      // --- 5. Ler Dados do Cliente (localStorage) ---
      console.log("Summary.tsx: Lendo cliente_info do localStorage...");
      const clienteInfoString = localStorage.getItem('cliente_info');
      let clienteData = { nome: 'N/A', sobrenome: 'N/A', telefone: 'N/A' };
      if (clienteInfoString) {
        try {
          const parsedData = JSON.parse(clienteInfoString);
          clienteData.nome = parsedData.nome || 'N/A';
          clienteData.sobrenome = parsedData.sobrenome || 'N/A';
          clienteData.telefone = parsedData.telefone || 'N/A';
        } catch (error) {
          console.error("Summary.tsx: Erro ao parsear cliente_info:", error);
          // Não lança erro, continua com dados padrão
        }
      } else {
        console.warn("Summary.tsx: cliente_info não encontrado no localStorage.");
      }
      
      // --- 6. Preparar e Inserir Dados do Pedido no DB ---
      const pedidoData = {
        nome: clienteData.nome,
        sobrenome: clienteData.sobrenome,
        telefone: clienteData.telefone,
        album_title: order.album.title,
        case_title: order.case?.title,
        album_base_price: order.album.price,
        case_price: order.case?.price,
        imagem_url: imageUrl, 
        user_id: session.user.id
      };
      console.log("Summary.tsx: Preparando para inserir na tabela 'pedidos'...", pedidoData);

      const { error: insertError } = await supabase
        .from('pedidos') 
        .insert([pedidoData])
        .select();

      if (insertError) {
        console.error("Summary.tsx: Erro ao inserir pedido (verifique RLS e nomes/tipos das colunas):", insertError); 
        throw new Error(`Erro ao salvar pedido: ${insertError.message}`);
      }
      console.log("Summary.tsx: Pedido inserido com sucesso na tabela 'pedidos'.");

      // --- 7. Abrir WhatsApp ---
      const messageText = `
PEDIDO DE ALBUM FOTOGRAFICO

Ola! Seu pedido foi gerado com sucesso.
Confira a imagem com todos os detalhes do seu album no link abaixo:

Visualizar resumo do album: ${imageUrl}

Obrigado por confiar no nosso trabalho!
      `;
      const trimmedMessage = messageText.trim().replace(/\n\s*/g, '\n');
      const message = encodeURIComponent(trimmedMessage);
      const phoneNumber = "5564992750733"; // Número já no formato correto com 55
      
      console.log("Summary.tsx: Abrindo WhatsApp...");
      try {
        const whatsappWindow = window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
        if (!whatsappWindow) {
          console.warn("Summary.tsx: Pop-up do WhatsApp bloqueado pelo navegador");
      toast({
            title: "WhatsApp Bloqueado", 
            description: "O navegador bloqueou a abertura do WhatsApp. Por favor, permita pop-ups para este site.", 
        variant: "default",
            duration: 10000 
          });
        }
      } catch (error) {
        console.error("Summary.tsx: Erro ao abrir WhatsApp:", error);
        toast({ 
          title: "Erro no WhatsApp", 
          description: "Não foi possível abrir o WhatsApp. Tente novamente.", 
          variant: "destructive" 
        });
      }

      toast({ title: "Sucesso!", description: "Pedido salvo e pronto para compartilhar.", variant: "default" });

    } catch (error: any) {
      console.error("Summary.tsx: Erro no bloco catch principal do handleShare:", error);
      // Mostra o toast apenas se não for o erro de autenticação (que já mostrou toast)
      if (error.message !== "Usuário não autenticado.") { 
         toast({ title: "Erro Inesperado", description: error.message || "Ocorreu um erro ao processar seu pedido.", variant: "destructive" });
      }
    } finally {
      setIsGeneratingImage(false);
      console.log("Summary.tsx: handleShare finalizado.");
    }
  };

  const handleComplete = () => {
    toast({
      title: "Pedido concluído!",
      description: "Seu pedido foi recebido com sucesso.",
      variant: "default",
    });
  };

  const handleNavigateToCheckout = () => {
    console.log("Summary.tsx: Navegando para /checkout...");
    window.location.href = '/checkout';
  };

  return (
    <PageLayout
      title="Resumo do Pedido"
      currentStep={6}
      prevPath="/site/estojo"
      hasSelection={true}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Div usada para gerar a imagem para compartilhamento */}
        <div 
          ref={orderSummaryRef} 
          className="absolute -left-[9999px] top-0 p-8 bg-[#111827] text-white w-[500px] space-y-6" // Estilização similar à imagem para captura
          style={{ display: 'none' }} // Inicialmente oculta
        >
          <h1 className="text-2xl font-bold text-center mb-6">Resumo do Pedido</h1>
          
          {/* Detalhes do Pedido (para imagem) */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold border-b border-gray-700 pb-2 mb-3">Detalhes do Pedido</h2>
            <div className="flex justify-between"><span>Modelo:</span> <span className="font-medium">{order.album.title}</span></div>
            <div className="flex justify-between"><span>Tamanho:</span> <span className="font-medium">{order.size.title}</span></div>
            <div className="flex justify-between"><span>Papel:</span> <span className="font-medium">{order.paper.label}</span></div>
            <div className="flex justify-between"><span>Laminação:</span> <span className="font-medium">{order.lamination.label}</span></div>
            <div className="flex justify-between"><span>Páginas:</span> <span className="font-medium">{order.pages.pages}</span></div>
            <div className="flex justify-between mt-3 pt-3 border-t border-gray-700">
              <span className="font-semibold">Valor do álbum:</span> 
              {/* Este cálculo pode precisar ser refinado para corresponder exatamente à imagem */}
              <span className="font-bold text-yellow-400">R$ {(order.size.price + order.pages.extraSheetsPrice + (order.lamination.price || 0)).toFixed(2)}</span>
            </div>
          </div>

          {/* Estojo (para imagem) */}
          {order.case && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold border-b border-gray-700 pb-2 mb-3">Estojo</h2>
              <div className="flex justify-between"><span>Modelo:</span> <span className="font-medium">{order.case.title}</span></div>
              <div className="flex justify-between">
                <span className="font-semibold">Valor:</span> 
                <span className="font-bold text-yellow-400">R$ {order.case.price.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Valor Total (para imagem) */}
          <div className="mt-6 pt-4 border-t border-gray-600">
            <div className="flex justify-between items-center">
              <p className="text-xl font-semibold">Valor Total:</p>
              <p className="text-2xl font-bold text-green-500">R$ {totalPrice.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Layout Visível para o Usuário - Removido card, ajustado padding/margens/cores/bordas */}
        <div className="max-w-2xl mx-auto px-4 py-6 text-gray-200 space-y-6">
          
          {/* Detalhes do Pedido */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold border-b border-gray-700 pb-2 mb-4">Detalhes do Pedido</h2>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Modelo:</span> 
              <span className="font-medium text-white">{order.album.title}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Tamanho:</span> 
              <span className="font-medium text-white">{order.size.title}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Papel:</span> 
              <span className="font-medium text-white">{order.paper.label}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Laminação:</span> 
              <span className="font-medium text-white">{order.lamination.label}</span> {/* Removido preço aqui para simplicidade, já que não está na imagem 1 */}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Páginas:</span> 
              <span className="font-medium text-white">{order.pages.pages}</span>
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
              <span className="font-semibold text-gray-300">Valor do álbum:</span> 
              <span className="font-bold text-yellow-400">R$ {(order.size.price + order.pages.extraSheetsPrice + (order.lamination.price || 0)).toFixed(2)}</span>
            </div>
          </div>

          {/* Estojo */}
          {order.case && (
            <div className="space-y-2 pt-5 border-t border-gray-700">
               <h2 className="text-xl font-semibold border-b border-gray-700 pb-2 mb-4">Estojo</h2>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Modelo:</span> 
                <span className="font-medium text-white">{order.case.title}</span>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700">
                <span className="font-semibold text-gray-300">Valor:</span> 
                <span className="font-bold text-yellow-400">R$ {order.case.price.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Valor Total */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="flex justify-between items-center">
              <p className="text-xl font-semibold text-gray-300">Valor Total:</p>
              <p className="text-2xl font-bold text-green-500">R$ {totalPrice.toFixed(2)}</p> {/* Cor ajustada para green-500 */}
            </div>
          </div>
          
          {/* Botões - Alinhados à direita */}
          <div className="flex justify-end items-center space-x-4 pt-6">
            <Button
              variant="outline"
              onClick={handleShare}
              disabled={isGeneratingImage}
              className="bg-gray-800 hover:bg-gray-700 border-gray-600 text-white hover:text-white"
            >
              {isGeneratingImage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartilhar
                </>
              )}
            </Button>
            
            <Button onClick={handleNavigateToCheckout} className="bg-green-600 hover:bg-green-700"> 
              <Check className="mr-2 h-4 w-4" />
              Concluir Pedido
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default SummaryPage;
