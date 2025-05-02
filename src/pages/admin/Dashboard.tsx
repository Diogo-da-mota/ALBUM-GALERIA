import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import toast from "@/components/ui/sonner"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from 'uuid';
import { Star, Trash2, Plus, Eye, Loader2 } from "lucide-react"
import SelectionCard from "@/components/ui/SelectionCard"
import { PedidoCard } from "@/components/admin/PedidoCard"

interface EstojoData {
  id: string
  title: string
  price: number
  image_urls: string[] | null
}

interface AlbumAdjustment {
  baseAdjustment: string;
  pageAdjustment: string;
}

// Interface para os dados do pedido buscados do Supabase
interface Pedido {
  id: string;
  nome: string;
  sobrenome: string;
  telefone: string;
  imagem_url: string;
  created_at: string;
  // Campos adicionais para o PDF
  album_title?: string;
  case_title?: string | null;
  album_base_price?: number;
  case_price?: number | null;
}

export function AdminDashboard() {
  const navigate = useNavigate()
  // Removido useAlbumPrices e estados relacionados se não forem mais usados aqui
  
  const [loading, setLoading] = useState(true)
  const [pedidosFinalizados, setPedidosFinalizados] = useState<Pedido[]>([]) // Garantir tipo correto
  
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      console.log("AdminDashboard: Iniciando busca de pedidos da tabela 'pedidos'...");
      try {
        // Select mais explícito para ajudar o TypeScript
        const { data: pedidosData, error: pedidosError } = await supabase
          .from('pedidos') 
          .select(`
            id, 
            nome, 
            sobrenome, 
            telefone, 
            imagem_url, 
            created_at, 
            album_title, 
            case_title, 
            album_base_price, 
            case_price
          `)
          .not('imagem_url', 'is', null) 
          .order('created_at', { ascending: false }); 

        if (pedidosError) {
          console.error("AdminDashboard: Erro ao buscar pedidos:", pedidosError);
          toast.error("Falha ao carregar pedidos finalizados.");
          setPedidosFinalizados([]); // Define como array vazio em caso de erro
        } else {
          console.log("AdminDashboard: Pedidos recebidos:", pedidosData);
          // Garantir que o tipo está correto antes de setar
          setPedidosFinalizados((pedidosData as Pedido[]) || []); 
        }

      } catch (error) {
         console.error("AdminDashboard: Erro no bloco catch:", error);
         toast.error("Falha geral ao carregar dados do painel.");
         setPedidosFinalizados([]);
      } finally {
         setLoading(false);
         console.log("AdminDashboard: Busca de pedidos finalizada.");
      }
    };
    loadDashboardData();
  }, [toast]);

  const handleViewSite = () => {
    window.open('/site', '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-white flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <p className="ml-3">Carregando painel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex justify-between items-center mb-8"> 
          <h1 className="text-2xl font-bold text-white">Dashboard Admin</h1>
          <div className="flex gap-4">
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleViewSite}
            >
              <Eye className="mr-2 h-4 w-4" />
              Ver o Site
            </Button>
          </div>
        </div>

        {/* Seção de Pedidos Finalizados */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-6">Pedidos Finalizados Recentes</h2>
          {pedidosFinalizados.length === 0 ? (
            <p className="text-gray-500">Nenhum pedido finalizado encontrado.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pedidosFinalizados.map((pedido) => (
                <PedidoCard 
                  key={pedido.id}
                  id={pedido.id}
                  imageUrl={pedido.imagem_url}
                  nome={pedido.nome}
                  sobrenome={pedido.sobrenome}
                  telefone={pedido.telefone}
                  createdAt={pedido.created_at}
                  // Passando props com nomes exatos das colunas (serão definidas em PedidoCardProps)
                  album_title={pedido.album_title}
                  case_title={pedido.case_title}
                  album_base_price={pedido.album_base_price}
                  case_price={pedido.case_price}
                />
              ))}
                  </div>
                )}
        </div>

        {/* Outras seções do Dashboard podem vir aqui */}
        <p className="text-gray-500 pt-8 border-t border-gray-800">
          Use a barra lateral para gerenciar preços, imagens de álbuns e estojos.
        </p>
        
      </div>
    </div>
  )
} 