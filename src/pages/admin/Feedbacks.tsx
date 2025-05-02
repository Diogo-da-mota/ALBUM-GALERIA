import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface Feedback {
  id: string;
  created_at: string;
  assunto: string;
  mensagem: string;
  email: string; // Email do usuário que enviou
  nome?: string; // Nome do usuário (opcional, se disponível)
  user_id: string;
}

// --- Componente do Formulário (para role='user') ---
function FeedbackForm() {
  const { toast } = useToast();
  const [assunto, setAssunto] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || null);
        // Tenta pegar o nome dos metadados ou usa o email como fallback
        const nameFromMeta = session.user.user_metadata?.full_name || session.user.user_metadata?.name;
        setUserName(nameFromMeta || session.user.email || null);
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assunto.trim() || !mensagem.trim() || !userId || !userEmail) {
      toast({ title: "Erro", description: "Preencha todos os campos.", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      const { error } = await supabase
        .from('feedbacks') 
        .insert({
          user_id: userId,
          email: userEmail,
          nome: userName, // Salva o nome obtido ou o email
          assunto: assunto,
          mensagem: mensagem,
        });

      if (error) throw error;

      toast({ title: "Sucesso", description: "Feedback enviado! Obrigado.", variant: "default" });
      setAssunto('');
      setMensagem('');
    } catch (error: any) {
      console.error("Erro ao enviar feedback:", error);
      toast({ title: "Erro", description: `Falha ao enviar feedback: ${error.message}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-[#1A1F2E] border-gray-800 text-white">
      <CardHeader>
        <CardTitle>Enviar Feedback</CardTitle>
        <CardDescription className="text-gray-400">
          Sua opinião é importante para nós.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="assunto" className="block text-sm font-medium text-gray-400 mb-1">Assunto</label>
            <Input 
              id="assunto"
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              required
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <label htmlFor="mensagem" className="block text-sm font-medium text-gray-400 mb-1">Mensagem</label>
            <Textarea 
              id="mensagem"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              required
              rows={5}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Enviar Feedback
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// --- Componente da Lista (para role='admin') ---
function FeedbackList() {
  const { toast } = useToast();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('feedbacks')
          .select('*') // Seleciona todas as colunas existentes
          .order('created_at', { ascending: false });

        if (error) throw error;
        setFeedbacks(data || []);
      } catch (error: any) {
        console.error("Erro ao buscar feedbacks:", error);
        toast({ title: "Erro", description: `Falha ao carregar feedbacks: ${error.message}`, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, [toast]);

  const formatarData = (dataISO: string) => {
    return new Date(dataISO).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <Card className="bg-[#1A1F2E] border-gray-800 text-white">
      <CardHeader>
        <CardTitle>Feedbacks Recebidos</CardTitle>
        <CardDescription className="text-gray-400">
          Lista dos últimos feedbacks enviados pelos usuários.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {feedbacks.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nenhum feedback recebido ainda.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-gray-700">
                <TableHead className="text-gray-400">Nome</TableHead>
                <TableHead className="text-gray-400">Email</TableHead>
                <TableHead className="text-gray-400">Assunto</TableHead>
                <TableHead className="text-gray-400">Mensagem</TableHead>
                <TableHead className="text-right text-gray-400">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedbacks.map((fb) => (
                <TableRow key={fb.id} className="border-gray-700">
                  <TableCell className="font-medium">{fb.nome || 'N/A'}</TableCell>
                  <TableCell>{fb.email}</TableCell>
                  <TableCell>{fb.assunto}</TableCell>
                  <TableCell className="max-w-xs truncate" title={fb.mensagem}>{fb.mensagem}</TableCell>
                  <TableCell className="text-right text-sm text-gray-500">{formatarData(fb.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// --- Componente Principal da Página ---
export default function FeedbacksPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);
  const { toast } = useToast(); // Adicionar toast para feedback de erro

  useEffect(() => {
    const fetchUserRole = async () => {
      setLoadingRole(true);
      try {
        // 1. Obter a sessão atual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Erro ao obter sessão:", sessionError);
          throw new Error("Erro ao verificar autenticação.");
        }

        if (session?.user) {
          const userId = session.user.id;
          // 2. Buscar o role na tabela 'users'
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', userId)
            .single(); // Espera um único resultado

          if (userError) {
            console.error("Erro ao buscar role do usuário:", userError);
            // Se o erro for 'PGRST116', significa que o usuário não foi encontrado na tabela users
            if (userError.code === 'PGRST116') {
               throw new Error("Perfil de usuário não encontrado.");
            } else {
               throw new Error("Erro ao buscar informações do usuário.");
            }
          }
          
          if (userData?.role) {
            console.log("Role do usuário buscado:", userData.role); // Log para depuração
            setUserRole(userData.role);
          } else {
             // Usuário encontrado, mas sem role definido?
             console.warn("Usuário encontrado, mas sem role definido na tabela users.");
             setUserRole(null); // Trata como sem permissão
          }

        } else {
          // Não há sessão ativa
           console.log("Nenhuma sessão de usuário ativa encontrada.");
           setUserRole(null); // Define como null se não estiver logado
        }
        
      } catch (error: any) {
        console.error("Erro no useEffect de FeedbacksPage:", error);
        toast({ 
          title: "Erro de Permissão", 
          description: error.message || "Não foi possível verificar suas permissões.", 
          variant: "destructive" 
        });
        setUserRole(null); // Define como null em caso de erro
      } finally {
        setLoadingRole(false);
      }
    };

    fetchUserRole();
  }, [toast]); // Adicionar toast como dependência

  if (loadingRole) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
         <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
       {/* Renderiza condicionalmente baseado no role */}
       {userRole === 'admin' && <FeedbackList />}
       {userRole === 'user' && <FeedbackForm />}
       {userRole !== 'admin' && userRole !== 'user' && (
         <p className="text-center text-red-500">Permissão negada ou papel de usuário desconhecido.</p>
       )}
    </div>
  );
} 