import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import toast from "@/components/ui/sonner"
import { useAlbumPrices } from "@/hooks/useAlbumPrices"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from 'uuid';
import { Star, Trash2, Plus } from "lucide-react"
import SelectionCard from "@/components/ui/SelectionCard" // Assumindo que este componente é reutilizável

export default function Albuns() {
  const { prices, fetchPrices, updateAlbumImageUrls } = useAlbumPrices()
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const [deletingImage, setDeletingImage] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        await fetchPrices()
      } catch (error) {
        console.error("Erro ao carregar álbuns:", error)
        toast.error("Falha ao carregar dados dos álbuns.")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [fetchPrices])

  const sanitizeFolderName = (text: string): string => {
    const withoutAccents = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return withoutAccents
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');
  };

  const handleDeleteImage = async (itemType: 'album' | 'estojo', itemId: string, imageUrl: string) => {
    try {
      setDeletingImage(imageUrl);
      const tableName = 'albums';
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
      const bucketName = 'album-images';
      const filePath = matches[1] + '/' + matches[2];
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");
      const { error: deleteError } = await supabase.storage.from(bucketName).remove([filePath]);
      if (deleteError) console.warn("Erro storage:", deleteError);
      updateAlbumImageUrls(itemId, updatedUrls); // Atualiza estado global
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
      const tableName = 'albums';
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
      updateAlbumImageUrls(itemId, updatedUrls); // Atualiza estado global
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

    const bucketName = 'album-images';
    const tableName = 'albums';
    const album = prices.find(a => a.id === itemId);
    if (!album) return toast.error("Álbum não encontrado!");
    const itemTitle = album.title;
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
      updateAlbumImageUrls(itemId, updatedUrls); // Atualiza estado global
      toast.success(`${newPublicUrls.length} imagens enviadas para ${itemTitle}!`);
    } catch (error: any) {
      console.error("Erro no upload:", error);
      toast.error(`Erro no upload: ${error.message}`);
    } finally {
      setUploading(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Reutilizando o componente ImageUploader, se existir e for adequado
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
    return <div className="min-h-screen bg-[#0B0F17] text-white flex justify-center items-center"><p>Carregando álbuns...</p></div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Gerenciar imagens dos álbuns</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prices.map((album) => (
          <Card key={album.id} className="p-6 bg-[#1A1F2E] border-gray-800 flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-white">{album.title}</h3>
            
            <div className="flex-grow mb-4">
              {album.image_urls && album.image_urls.length > 0 ? (
                <SelectionCard
                  id={album.id}
                  title={album.title}
                  price={album.price || 0} // Passando o preço se necessário para SelectionCard
                  images={album.image_urls}
                  isSelected={false} // Não aplicável aqui
                  onClick={() => {}} // Não aplicável aqui
                  className="mb-4 h-full" // Ajustar className conforme necessário
                  onDeleteImage={(imageUrl) => handleDeleteImage('album', album.id, imageUrl)}
                  onSetMainImage={(imageUrl) => handleSetMainImage('album', album.id, imageUrl)}
                />
              ) : (
                <div className="bg-gray-800 bg-opacity-50 rounded-md p-4 text-center h-full flex items-center justify-center">
                  <p className="text-gray-400 text-sm">Nenhuma imagem disponível</p>
                </div>
              )}
            </div>
            
            <ImageUploader type="album" item={album} />
            
          </Card>
        ))}
      </div>
    </div>
  )
} 