import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useAvatar } from '@/contexts/AvatarContext';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface Props {
  onSubmit: (data: { nome: string; sobrenome: string; telefone: string }) => void;
}

export function IdentificacaoCliente({ onSubmit }: Props) {
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);

  const { avatarUrl } = useAvatar();

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permite apenas números e limita o tamanho (opcional)
    const value = e.target.value.replace(/\D/g, ''); 
    setTelefone(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!nome.trim() || !sobrenome.trim() || !telefone.trim()) {
      toast({ title: "Atenção", description: "Por favor, preencha todos os campos." });
      setLoading(false);
      return;
    }
    
    // Validação simples de telefone (ex: mínimo 10 dígitos)
    if (telefone.length < 10) {
      toast({ title: "Atenção", description: "Número de telefone inválido." });
      setLoading(false);
      return;
    }

    // Simula um pequeno delay (opcional)
    setTimeout(() => {
      onSubmit({ nome, sobrenome, telefone });
      // Não precisa mais setar loading false aqui, pois o componente será desmontado
    }, 300); 
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0B0F17]">
      <Card className="w-full max-w-md bg-[#1A1F2E] border-gray-800 text-white">
        <CardHeader className="items-center">
          <UserAvatar avatarUrl={avatarUrl} size="lg" className="w-20 h-20 mb-4" />
          <CardTitle className="text-2xl">Identificação</CardTitle>
          <CardDescription className="text-gray-400">
            Precisamos de algumas informações para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="nome" className="text-sm text-gray-400">Nome</label>
              <Input 
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu primeiro nome"
                required
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="sobrenome" className="text-sm text-gray-400">Sobrenome</label>
              <Input 
                id="sobrenome"
                type="text"
                value={sobrenome}
                onChange={(e) => setSobrenome(e.target.value)}
                placeholder="Seu sobrenome"
                required
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="telefone" className="text-sm text-gray-400">Telefone (com DDD)</label>
              <Input 
                id="telefone"
                type="tel" // Use type="tel" para semântica e teclados mobile
                value={telefone}
                onChange={handleTelefoneChange}
                placeholder="Ex: 11999998888"
                required
                minLength={10} // Validação básica HTML
                maxLength={11} // Validação básica HTML
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Continuando...' : 'Continuar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 