import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import toast from "@/components/ui/sonner"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from 'uuid';
import { Star, Trash2, Plus } from "lucide-react"
import SelectionCard from "@/components/ui/SelectionCard" // Assumindo reutilização

interface EstojoData {
  id: string
  title: string
  price: number
  image_urls: string[] | null
}

export default function Estojos() {
  const [estojos, setEstojos] = useState<EstojoData[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const [editingEstojoPrices, setEditingEstojoPrices] = useState<Record<string, number>>({})
  const [deletingImage, setDeletingImage] = useState<string | null>(null)

  useEffect(() => {
    const fetchEstojos = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('estojos')
          .select('id, title, price, image_urls')
          .order('title');

        if (error) {
          console.error("Erro ao buscar estojos:", error);
          toast.error("Erro ao carregar dados dos estojos.");
          throw error;
        }

        setEstojos(data || []);
      } catch (error) {
        // Já tratado no bloco if (error)
      } finally {
        setLoading(false);
      }
    };
    fetchEstojos();
  }, []);

  useEffect(() => {
    const initialEstojoPrices: Record<string, number> = {}
    estojos.forEach(estojo => {
      initialEstojoPrices[estojo.id] = estojo.price || 0
    })
    setEditingEstojoPrices(initialEstojoPrices)
  }, [estojos])
  
  const handleEstojoPriceChange = (id: string, newPrice: string) => {
    const parsedPrice = parseFloat(newPrice)
    if (!isNaN(parsedPrice)) {
      setEditingEstojoPrices(prev => ({
        ...prev,
        [id]: parsedPrice
      }))
    }
  }

  const handleSalvarEstojoPrice = async (id: string) => {
    const newPrice = editingEstojoPrices[id]
    if (isNaN(newPrice)) return
    
    const currentPrice = estojos.find(estojo => estojo.id === id)?.price || 0
    if (Math.abs(currentPrice - newPrice) < 0.01) return

    try {
      const { error } = await supabase
        .from('estojos')
        .update({ price: newPrice })
        .eq('id', id)
      if (error) throw error
      setEstojos(prev => 
        prev.map(estojo => 
          estojo.id === id ? { ...estojo, price: newPrice } : estojo
        )
      )
      toast.success("Preço do estojo atualizado!")
    } catch (error: any) {
      console.error("Erro ao atualizar preço:", error)
      toast.error(`Erro: ${error.message}`)
    }
  }

  const sanitizeFolderName = (text: string): string => {
    const withoutAccents = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return withoutAccents
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');
  };

  const updateEstojoImageUrls = (estojoId: string, newUrls: string[]) => {
      setEstojos(prev => 
        prev.map(estojo => 
          estojo.id === estojoId 
            ? { ...estojo, image_urls: newUrls } 
            : estojo
        )
      );
  }

  const handleDeleteImage = async (itemType: 'album' | 'estojo', itemId: string, imageUrl: string) => {
    try {
      setDeletingImage(imageUrl);
      const tableName = 'estojos';
      const { data, error: fetchError } = await supabase
        .from(tableName)
        .select('image_urls')
        .eq('id', itemId)
        .single();
      if (fetchError) throw fetchError;
      const currentUrls = data?.image_urls || [];
      const updatedUrls = currentUrls.filter(url => url !== imageUrl);
      const { error: updateError } = await supabase
        .from(tableName)
        .update({ image_urls: updatedUrls })
        .eq('id', itemId);
      if (updateError) throw updateError;
      const matches = imageUrl.match(/\/([^\/]+)\/([^\/]+)$/);
      if (!matches || matches.length < 3) throw new Error("Caminho inválido");
      const bucketName = 'estojo-images'; // Bucket correto
      const filePath = matches[1] + '/' + matches[2];
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");
      const { error: deleteError } = await supabase.storage.from(bucketName).remove([filePath]);
      if (deleteError) console.warn("Erro storage:", deleteError);
      updateEstojoImageUrls(itemId, updatedUrls); // Atualiza estado local
      toast.success("Imagem excluída!");
    } catch (error: any) {
      console.error("Erro ao excluir:", error);
      toast.error(`Erro: ${error.message}`);
    } finally {
      setDeletingImage(null);
    }
  };

  const handleSetMainImage = async (itemType: 'album' | 'estojo', itemId: string, imageUrl: string) => {
    try {
      const tableName = 'estojos';
      const { data, error: fetchError } = await supabase
        .from(tableName)
        .select('image_urls')
        .eq('id', itemId)
        .single();
      if (fetchError) throw fetchError;
      const currentUrls = data?.image_urls || [];
      const updatedUrls = [imageUrl, ...currentUrls.filter(url => url !== imageUrl)];
      const { error: updateError } = await supabase
        .from(tableName)
        .update({ image_urls: updatedUrls })
        .eq('id', itemId);
      if (updateError) throw updateError;
      updateEstojoImageUrls(itemId, updatedUrls); // Atualiza estado local
      toast.success("Imagem principal definida!");
    } catch (error: any) {
      console.error("Erro ao definir principal:", error);
      toast.error(`Erro: ${error.message}`);
    }
  };

  const handleImageUpload = async (itemType: 'album' | 'estojo', itemId: string, files: FileList | null) => {
    if (!files || files.length === 0) return toast.info("Nenhum arquivo.");
    if (files.length > 6) return toast.warning("Máximo 6 imagens.");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return toast.error("Não autenticado.");

    const bucketName = 'estojo-images'; // Bucket correto
    const tableName = 'estojos';
    const estojo = estojos.find(e => e.id === itemId);
    if (!estojo) return toast.error("Estojo não encontrado!");
    const itemTitle = estojo.title;
    const folderName = sanitizeFolderName(itemTitle);
    if (!folderName) return toast.error("Nome de pasta inválido.");

    setUploading(prev => ({ ...prev, [itemId]: true }));
    toast.info(`Iniciando upload para ${itemTitle}...`);

    try {
      const token = session?.access_token;
      if (!token) throw new Error("Sessão expirada.");
      const newPublicUrls: string[] = [];
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) throw new Error("URL Supabase não encontrada.");

      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const uniqueFileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${folderName}/${uniqueFileName}`;
        const response = await fetch(
          `${supabaseUrl}/storage/v1/object/${bucketName}/${filePath}`,
          {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": file.type, "x-upsert": "true" },
            body: file,
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Falha no upload: ${errorData.error || 'Erro desconhecido'}`);
        }
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;
        newPublicUrls.push(publicUrl);
      }

      const { data: currentData, error: fetchError } = await supabase
        .from(tableName).select('image_urls').eq('id', itemId).single();
      if (fetchError) throw new Error("Erro ao buscar URLs existentes.");
      const existingUrls = currentData?.image_urls || [];
      const updatedUrls = [...existingUrls, ...newPublicUrls];
      const { error: updateError } = await supabase
        .from(tableName).update({ image_urls: updatedUrls }).eq('id', itemId);
      if (updateError) throw new Error("Erro ao salvar URLs.");
      updateEstojoImageUrls(itemId, updatedUrls); // Atualiza estado local
      toast.success(`${newPublicUrls.length} imagens enviadas para ${itemTitle}!`);
    } catch (error: any) {
      console.error("Erro no upload:", error);
      toast.error(`Erro no upload: ${error.message}`);
    } finally {
      setUploading(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Reutilizando o componente ImageUploader
  const ImageUploader = ({ type, item }: { type: 'album' | 'estojo', item: any }) => {
    const isUploading = uploading[item.id];
    const maxImages = 6;
    const currentImages = item.image_urls?.length || 0;
    const remainingSlots = maxImages - currentImages;
    
    if (remainingSlots <= 0) {
      return (
        <div className="bg-red-900 bg-opacity-20 rounded-md p-2 text-center">
          <p className="text-red-400 text-xs">Limite de {maxImages} imagens atingido</p>
        </div>
      );
    }
    
    return (
      <div 
        className={`border-2 border-dashed border-gray-700 rounded-lg p-4 text-center cursor-pointer transition-all ${isUploading ? 'opacity-50' : 'hover:border-blue-500'}`}
        onClick={() => !isUploading && document.getElementById(`upload-${type}-${item.id}`)?.click()}
      >
        <input
          type="file"
          id={`upload-${type}-${item.id}`}
          hidden
          multiple
          accept="image/*"
          onChange={(e) => handleImageUpload(type, item.id, e.target.files)}
          disabled={isUploading}
        />
        <div className="flex flex-col items-center justify-center">
          <Plus size={24} className="text-blue-500 mb-1" />
          <p className="text-sm text-gray-400">
            {isUploading ? 'Enviando...' : `Upload imagens (${currentImages}/${maxImages})`}
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0B0F17] text-white flex justify-center items-center"><p>Carregando estojos...</p></div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Gerenciar imagens dos estojos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {estojos.map((estojo) => (
          <Card key={estojo.id} className="p-6 bg-[#1A1F2E] border-gray-800 flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-white">{estojo.title}</h3>
            <div className="mb-4">
              <label className="text-sm text-gray-400 block mb-2">Preço (R$)</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.01"
                  value={editingEstojoPrices[estojo.id] || 0}
                  onChange={(e) => handleEstojoPriceChange(estojo.id, e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSalvarEstojoPrice(estojo.id)}
                  onBlur={() => handleSalvarEstojoPrice(estojo.id)}
                  className="bg-gray-800 border-gray-700 w-full text-white [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Button 
                  onClick={() => handleSalvarEstojoPrice(estojo.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Salvar
                </Button>
              </div>
            </div>
            
            <div className="flex-grow mb-4">
              {estojo.image_urls && estojo.image_urls.length > 0 ? (
                <SelectionCard
                  id={estojo.id}
                  title={estojo.title}
                  price={estojo.price || 0}
                  images={estojo.image_urls}
                  isSelected={false}
                  onClick={() => {}} 
                  className="mb-4 h-full"
                  onDeleteImage={(imageUrl) => handleDeleteImage('estojo', estojo.id, imageUrl)}
                  onSetMainImage={(imageUrl) => handleSetMainImage('estojo', estojo.id, imageUrl)}
                />
              ) : (
                <div className="bg-gray-800 bg-opacity-50 rounded-md p-4 text-center h-full flex items-center justify-center">
                  <p className="text-gray-400 text-sm">Nenhuma imagem disponível</p>
                </div>
              )}
            </div>
            
            <ImageUploader type="estojo" item={estojo} />
            
          </Card>
        ))}
      </div>
    </div>
  )
} 