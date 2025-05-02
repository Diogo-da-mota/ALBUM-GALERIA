import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface UseImageUploadOptions {
  bucket: string;
  maxSizeInMB?: number;
  allowedTypes?: string[];
}

interface UploadResult {
  publicUrl: string | null;
  error?: Error;
}

export function useImageUpload({ 
  bucket, 
  maxSizeInMB = 1,
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
}: UseImageUploadOptions) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const validateFile = (file: File): Error | null => {
    if (file.size > maxSizeInMB * 1024 * 1024) {
      return new Error(`Arquivo deve ter no máximo ${maxSizeInMB}MB`);
    }
    
    if (!allowedTypes.includes(file.type)) {
      return new Error(`Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`);
    }

    return null;
  };

  const uploadImage = async (
    file: File, 
    userId: string, 
    fileName: string
  ): Promise<UploadResult> => {
    setLoading(true);
    try {
      // Validar arquivo
      const validationError = validateFile(file);
      if (validationError) {
        throw validationError;
      }

      const filePath = `${userId}/${fileName}`;

      // Listar e remover arquivos existentes
      const { data: existingFiles, error: listError } = await supabase.storage
        .from(bucket)
        .list(userId);

      if (listError) {
        console.warn('Erro ao listar arquivos:', listError);
      } else if (existingFiles?.length > 0) {
        const filesToRemove = existingFiles.map(file => `${userId}/${file.name}`);
        await supabase.storage
          .from(bucket)
          .remove(filesToRemove);
      }

      // Converter para PNG
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png', 1);
      });

      // Upload
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, blob, {
          upsert: true,
          contentType: 'image/png'
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return { publicUrl: data.publicUrl };

    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro",
        description: error.message || 'Erro ao fazer upload',
        variant: "destructive"
      });
      return { publicUrl: null, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    uploadImage,
    loading
  };
} 