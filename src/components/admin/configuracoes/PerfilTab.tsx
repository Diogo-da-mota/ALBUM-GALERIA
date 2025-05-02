import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Usar Label para acessibilidade
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Upload, Building2, Mail, Phone, MapPin, Smartphone, User, MessageSquare, Save } from 'lucide-react'; // Ícones relevantes
import { useToast } from '@/components/ui/use-toast';
import { Badge } from "@/components/ui/badge"; // Importar Badge
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useAvatar } from '@/contexts/AvatarContext'; // Importar o hook

// Interface para dados do perfil
interface UserProfile {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  studio_name?: string | null;
  avatar_url?: string | null;
  // Dados do perfil_config
  perfil?: {
    nome_empresa: string | null;
    endereco: string | null;
    cidade: string | null;
    estado: string | null;
    cep: string | null;
    telefone: string | null;
    whatsapp: string | null;
    email: string | null;
  } | null;
}

export default function PerfilTab() {
  const { toast } = useToast();
  const { avatarUrl: contextAvatarUrl, updateAvatar } = useAvatar(); // Obter URL do contexto e função de update
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null); // Apenas para preview local

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error("Usuário não autenticado.");

        // Buscar dados do usuário
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, name, email, role, studio_name, avatar_url')
          .eq('id', session.user.id)
          .single();

        if (userError && userError.code !== 'PGRST116') { 
           throw userError;
        }

        // Buscar dados do perfil_config
        const { data: perfilData, error: perfilError } = await supabase
          .from('perfil_config')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (perfilError && perfilError.code !== 'PGRST116') {
          console.warn("Erro ao buscar perfil_config:", perfilError);
        }
        
        // Preenche com dados existentes ou valores padrão
        setProfile({
            id: session.user.id,
            email: session.user.email || null,
            name: userData?.name || session.user.user_metadata?.full_name || '',
            role: userData?.role || null,
            studio_name: userData?.studio_name || '',
            avatar_url: userData?.avatar_url || null,
            perfil: perfilData || {
              nome_empresa: '',
              endereco: '',
              cidade: '',
              estado: '',
              cep: '',
              telefone: '',
              whatsapp: '',
              email: session.user.email || ''
            }
        });

      } catch (error: any) {
        console.error("Erro detalhado ao buscar perfil:", error);
        toast({ title: "Erro", description: `Falha ao carregar perfil: ${error.message || 'Erro desconhecido'}`, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Se o campo pertence ao perfil_config
    if (['nome_empresa', 'endereco', 'cidade', 'estado', 'cep', 'telefone', 'whatsapp', 'email'].includes(name)) {
      setProfile(prev => prev ? {
        ...prev,
        perfil: {
          ...prev.perfil,
          [name]: value
        }
      } : null);
    } else {
      // Campos da tabela users
      setProfile(prev => prev ? { ...prev, [name]: value } : null);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async (): Promise<string | null> => {
    // Se não há arquivo novo, retorna a URL base atual do perfil (ou null)
    if (!avatarFile || !profile) return profile?.avatar_url || null;

    const filePath = `${profile.id}/avatar.png`;

    console.log("Iniciando upload do avatar para:", filePath);
    // Remover toast daqui, será mostrado ao salvar perfil completo
    // toast({ title: "Upload", description: "Enviando imagem do avatar..."});

    try {
      // Listar e remover imagens existentes do usuário
      const { data: existingFiles, error: listError } = await supabase.storage
        .from('avatars')
        .list(profile.id);

      if (listError) {
        console.warn('Erro ao listar arquivos:', listError);
      } else if (existingFiles?.length > 0) {
        const filesToRemove = existingFiles.map(file => `${profile.id}/${file.name}`);
        const { error: removeError } = await supabase.storage
          .from('avatars')
          .remove(filesToRemove);

        if (removeError) {
          console.warn('Erro ao remover arquivos antigos:', removeError);
        }
      }

      // Converter imagem para PNG usando canvas
      const img = new Image();
      img.src = URL.createObjectURL(avatarFile);
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);

      // Converter canvas para Blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png', 1);
      });

      // Upload do arquivo
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, { 
          upsert: true,
          cacheControl: '3600',
          contentType: 'image/png'
        });

      if (uploadError) throw uploadError;

      // Obter URL pública BASE (sem timestamp) do Supabase Storage
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicBaseUrl = data.publicUrl;

      // Atualizar o contexto com a NOVA URL BASE
      // O contexto cuidará de adicionar o cache-busting
      updateAvatar(publicBaseUrl);

      // Atualizar preview local com a URL com timestamp para feedback imediato
      setAvatarPreview(`${publicBaseUrl}?v=${Date.now()}`);

      // Limpar o arquivo do state após upload bem-sucedido
      setAvatarFile(null);

      // Retornar URL base para salvar no banco
      return publicBaseUrl;

    } catch (error) {
      console.error("Erro ao fazer upload do avatar:", error);
      toast({ title: "Erro", description: "Falha ao fazer upload do avatar", variant: "destructive" });
      // Retorna a URL antiga em caso de erro
      return profile?.avatar_url || null;
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      // 1. Fazer upload do avatar se houver um novo arquivo
      const baseAvatarUrl = await handleAvatarUpload();

      // 2. Preparar dados para atualização da tabela users
      const userUpdates = {
        name: profile.name,
        studio_name: profile.studio_name,
        avatar_url: baseAvatarUrl, // URL base sem timestamp
        updated_at: new Date().toISOString()
      };

      // 3. Atualizar tabela users
      const { error: userError } = await supabase
        .from('users')
        .update(userUpdates)
        .eq('id', profile.id)
        .select()
        .single();

      if (userError) throw userError;

      // Atualizar o state do profile com a URL base
      setProfile(prev => prev ? {
        ...prev,
        avatar_url: baseAvatarUrl // URL base sem timestamp
      } : null);

      // 4. Preparar dados para perfil_config
      const perfilUpdates = {
        user_id: profile.id,
        nome_empresa: profile.perfil?.nome_empresa || '',
        endereco: profile.perfil?.endereco || '',
        cidade: profile.perfil?.cidade || '',
        estado: profile.perfil?.estado || '',
        cep: profile.perfil?.cep || '',
        telefone: profile.perfil?.telefone || '',
        whatsapp: profile.perfil?.whatsapp || '',
        email: profile.perfil?.email || profile.email || '',
        updated_at: new Date().toISOString()
      };

      // 5. Atualizar perfil_config usando upsert
      const { error: perfilError } = await supabase
        .from('perfil_config')
        .upsert(perfilUpdates, {
          onConflict: 'user_id'
        });

      if (perfilError) throw perfilError;

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!"
      });

      // Limpar o preview local após salvar com sucesso
      setAvatarPreview(null);

      // Atualizar localStorage com a URL base
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      userData.name = profile.name;
      userData.avatar_url = baseAvatarUrl;
      localStorage.setItem('user', JSON.stringify(userData));

    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: "Erro",
        description: error.message || 'Erro ao salvar perfil',
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-400 py-10">Carregando perfil...</p>;
  }

  if (!profile) {
    return <p className="text-center text-red-500 py-10">Não foi possível carregar o perfil.</p>;
  }

  return (
    <Card className="bg-[#1A1F2E]/80 backdrop-blur-sm border border-gray-700/50 text-white">
      <CardHeader>
        <CardTitle>Dados da Empresa</CardTitle>
        <CardDescription className="text-gray-400">
          Configure as informações da sua empresa ou negócio.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seção de Logo/Avatar */}
        <div className="flex items-center space-x-6">
          <UserAvatar avatarUrl={avatarPreview !== null ? avatarPreview : contextAvatarUrl} size="lg" />
          <div className="flex-1">
             <Label htmlFor="avatar-upload" className="text-sm text-gray-400 mb-2 block">Logo</Label>
             <Input 
               id="avatar-upload" 
               type="file" 
               accept="image/*" 
               onChange={handleAvatarChange} 
               className="hidden"
             />
             <Button 
                type="button" 
                variant="outline"
                onClick={() => document.getElementById('avatar-upload')?.click()}
                className="bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
             > 
                 <Upload className="mr-2 h-4 w-4" />
                 Upload de logo
            </Button>
             <p className="text-xs text-gray-500 mt-1">Envie um arquivo JPG, PNG ou GIF (Máx. 1MB).</p>
          </div>
        </div>
        
        {/* Nome e Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <Label htmlFor="name">Nome da Empresa</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input id="name" name="name" value={profile.name || ''} onChange={handleInputChange} placeholder="Estúdio Fotográfico" className="pl-10 bg-gray-800 border-gray-700" />
            </div>
          </div>
           <div className="space-y-1">
            <Label htmlFor="email">E-mail Comercial</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input id="email" name="email" value={profile.email || ''} placeholder="contato@estudiofotografico.com" className="pl-10 bg-gray-900 border-gray-700 text-gray-400 cursor-not-allowed" readOnly />
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="space-y-1">
          <Label htmlFor="rua">Endereço</Label>
          <div className="relative">
             <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
             <Input id="rua" name="rua" value={profile.perfil?.endereco || ''} onChange={handleInputChange} placeholder="Rua das Flores, 123" className="pl-10 bg-gray-800 border-gray-700" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label htmlFor="cidade">Cidade</Label>
            <Input id="cidade" name="cidade" value={profile.perfil?.cidade || ''} onChange={handleInputChange} placeholder="São Paulo" className="bg-gray-800 border-gray-700" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="estado">Estado</Label>
            <Input id="estado" name="estado" value={profile.perfil?.estado || ''} onChange={handleInputChange} placeholder="SP" maxLength={2} className="bg-gray-800 border-gray-700" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cep">CEP</Label>
            <Input id="cep" name="cep" value={profile.perfil?.cep || ''} onChange={handleInputChange} placeholder="01234-567" className="bg-gray-800 border-gray-700" />
          </div>
        </div>

        {/* Telefones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <Label htmlFor="telefone">Telefone Comercial</Label>
             <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input id="telefone" name="telefone" type="tel" value={profile.perfil?.telefone || ''} onChange={handleInputChange} placeholder="(11) 3456-7890" className="pl-10 bg-gray-800 border-gray-700" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
                 <Label htmlFor="whatsapp">WhatsApp para Integrações</Label>
                 <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-600/50">Novo</Badge>
            </div>
             <div className="flex items-center space-x-2">
                 <div className="relative flex-grow">
                   <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                   <Input id="whatsapp" name="whatsapp" type="tel" value={profile.perfil?.whatsapp || ''} onChange={handleInputChange} placeholder="(11) 98765-4321" className="pl-10 bg-gray-800 border-gray-700" />
                 </div>
                 <Button 
                    type="button" 
                    size="icon" 
                    variant="outline"
                    className="bg-green-600 hover:bg-green-700 border-green-700 p-2"
                    onClick={() => console.log('Botão Chat Clicado')}
                 >
                    <MessageSquare className="h-4 w-4 text-white"/>
                 </Button>
             </div>
             <p className="text-xs text-gray-500 mt-1">Este número será usado para integrações com WhatsApp e envio de mensagens para clientes.</p>
          </div>
        </div>

         {/* Botão Salvar */}
         <div className="flex justify-end pt-4">
            <Button onClick={handleSaveProfile} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
         </div>
      </CardContent>
    </Card>
  );
} 