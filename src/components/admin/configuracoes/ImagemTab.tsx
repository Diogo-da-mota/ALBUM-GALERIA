import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useAvatar } from '@/contexts/AvatarContext';
import { useImageUpload } from '@/hooks/useImageUpload';
import { ImageCropper } from '@/components/ui/ImageCropper';

export default function ImagemTab() {
  const { toast } = useToast();
  const { avatarUrl: contextAvatarUrl, updateAvatar } = useAvatar();
  const [croppedLogoFile, setCroppedLogoFile] = useState<File | null>(null);
  const [croppedPreviewUrl, setCroppedPreviewUrl] = useState<string | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  
  const { uploadImage, loading } = useImageUpload({
    bucket: 'avatars',
    maxSizeInMB: 1,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif']
  });

  useEffect(() => {
    const fetchLogo = async () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user?.id) {
        const { data, error } = await supabase
          .from('users')
          .select('avatar_url')
          .eq('id', user.id)
          .single();
        
        if (!error && data?.avatar_url) {
          setCroppedPreviewUrl(data.avatar_url);
        }
      }
    };
    fetchLogo();
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Criar URL temporária para o cropper
      const tempUrl = URL.createObjectURL(file);
      setTempImageUrl(tempUrl);
      setCropperOpen(true);
      
      // Limpar input para permitir selecionar o mesmo arquivo novamente
      e.target.value = '';
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    // Converter Blob para File
    const file = new File([croppedBlob], 'avatar.png', { type: 'image/png' });
    setCroppedLogoFile(file);
    
    // Criar preview local (Data URL) da imagem recortada
    const reader = new FileReader();
    reader.onloadend = () => {
      setCroppedPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Limpar URL temporária
    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl);
      setTempImageUrl(null);
    }
  };

  const handleSaveLogo = async () => {
    if (!croppedLogoFile) return;
    
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user?.id) throw new Error('Usuário não encontrado');

      // Upload usando o hook com o arquivo recortado
      const { publicUrl, error } = await uploadImage(croppedLogoFile, user.id, 'avatar.png');
      if (error) throw error;
      if (!publicUrl) throw new Error('URL não gerada');

      // Atualizar contexto com URL base
      updateAvatar(publicUrl);
      
      // Limpar estados locais após salvar
      setCroppedLogoFile(null);
      setCroppedPreviewUrl(null);

      // Atualizar URL base no banco
      const { error: updateError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (updateError) throw updateError;

      toast({
        title: "Sucesso",
        description: "Logo atualizada com sucesso!"
      });

      // Atualizar o localStorage com a URL base
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      userData.avatar_url = publicUrl;
      localStorage.setItem('user', JSON.stringify(userData));

    } catch (error: any) {
      console.error('Erro ao salvar logo:', error);
      toast({
        title: "Erro",
        description: error.message || 'Erro ao salvar logo',
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="bg-[#1A1F2E]/80 backdrop-blur-sm border border-gray-700/50 text-white">
      <CardHeader>
        <CardTitle>Logotipo</CardTitle>
        <CardDescription className="text-gray-400">
          Faça upload da logo da sua empresa que será exibida no sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preview da Logo */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <UserAvatar 
            avatarUrl={croppedPreviewUrl !== null ? croppedPreviewUrl : contextAvatarUrl} 
            size="lg" 
            className="w-32 h-32" 
          />
          
          {/* Upload Button */}
          <div className="flex flex-col items-center space-y-4">
            <input
              type="file"
              id="logo-upload"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
            <label htmlFor="logo-upload">
              <Button 
                variant="outline" 
                className="cursor-pointer"
                asChild
              >
                <div>
                  <Upload className="w-4 h-4 mr-2" />
                  Carregar Logo
                </div>
              </Button>
            </label>
            {croppedLogoFile && (
              <Button
                onClick={handleSaveLogo}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Salvando..." : "Salvar Logo"}
              </Button>
            )}
          </div>
        </div>

        {/* Instruções */}
        <div className="text-sm text-gray-400 mt-4">
          <p>• Tamanho máximo: 1MB</p>
          <p>• Formatos aceitos: JPG, PNG ou GIF</p>
          <p>• Recomendado: imagem quadrada para melhor exibição</p>
        </div>

        {/* Image Cropper */}
        {tempImageUrl && (
          <ImageCropper
            imageUrl={tempImageUrl}
            onCropComplete={handleCropComplete}
            aspectRatio={1}
            open={cropperOpen}
            onOpenChange={setCropperOpen}
          />
        )}
      </CardContent>
    </Card>
  );
}