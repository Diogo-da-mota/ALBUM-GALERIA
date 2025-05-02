import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, User } from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useAvatar } from '@/contexts/AvatarContext';

const ADMIN_EMAIL = 'anunciodofacebook2022@gmail.com';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { avatarUrl } = useAvatar();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleResetPassword = async (email: string) => {
    if (!email) {
      toast.error('Por favor, digite seu email');
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      toast.success('Email de redefinição de senha enviado! Verifique sua caixa de entrada.');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar email de redefinição');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    try {
      setIsLoading(true);

      // Primeiro, limpa qualquer sessão existente
      await supabase.auth.signOut();

      // Tenta fazer login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Usuário não encontrado');
      }

      // Se for o email admin conhecido, já trata como admin
      if (formData.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        if (!isAdmin) {
          throw new Error('Por favor, use a área administrativa para fazer login.');
        }

        // Tenta criar/atualizar o perfil admin se não existir
        const { error: upsertError } = await supabase
          .from('users')
          .upsert({
            id: authData.user.id,
            email: authData.user.email,
            role: 'admin',
            name: 'Administrador'
          }, {
            onConflict: 'id'
          });

        if (upsertError) {
          console.warn('Erro ao atualizar perfil admin:', upsertError);
        }

        localStorage.setItem('user', JSON.stringify({
          id: authData.user.id,
          email: authData.user.email,
          role: 'admin'
        }));

        navigate('/admin');
        toast.success('Login administrativo realizado com sucesso!');
        return;
      }

      // Para outros usuários, busca o perfil normalmente
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', authData.user.id)
        .maybeSingle();

      // Se houver erro na busca do perfil ou perfil não encontrado
      if (userError || !userData) {
        console.warn('Erro ou perfil não encontrado:', userError);
        
        if (isAdmin) {
          throw new Error('Acesso negado. Esta área é restrita para administradores.');
        }

        // Para usuários normais, cria um perfil padrão
        const { error: createError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            role: 'user',
            name: 'Fotógrafo'
          });

        if (createError) {
          console.error('Erro ao criar perfil:', createError);
          throw new Error('Erro ao criar perfil de usuário');
        }

        localStorage.setItem('user', JSON.stringify({
          id: authData.user.id,
          email: authData.user.email,
          role: 'user'
        }));

        navigate('/albuns');
        toast.success('Login realizado com sucesso!');
        return;
      }

      // Verifica se está tentando entrar na área correta
      if (isAdmin && userData.role !== 'admin') {
        throw new Error('Acesso negado. Esta área é restrita para administradores.');
      }

      if (!isAdmin && userData.role === 'admin') {
        throw new Error('Por favor, use a área administrativa para fazer login.');
      }

      // Armazena os dados do usuário
      localStorage.setItem('user', JSON.stringify({
        id: authData.user.id,
        email: authData.user.email,
        role: userData.role
      }));

      // Redireciona baseado no role
      navigate(userData.role === 'admin' ? '/admin' : '/albuns');
      toast.success('Login realizado com sucesso!');

    } catch (error: any) {
      console.error('Erro no login:', error);
      toast.error(error.message || 'Erro ao fazer login');
      await supabase.auth.signOut();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F17] bg-cover bg-no-repeat">
      <Card className="max-w-md w-full p-8 bg-[#1A1F2E] border-gray-800">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <UserAvatar avatarUrl={avatarUrl} size="lg" className="w-20 h-20" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {isAdmin ? 'Área Administrativa' : 'Área do Fotógrafo'}
          </h2>
          <p className="text-gray-400 text-sm">
            {isAdmin 
              ? 'Acesso restrito para administradores' 
              : 'Faça login para acessar seu painel'}
          </p>
        </div>

        <div className="flex items-center justify-center space-x-4 py-6">
          <Label htmlFor="role-toggle" className={!isAdmin ? 'text-white' : 'text-gray-400'}>
            Fotógrafo
          </Label>
          <Switch
            id="role-toggle"
            checked={isAdmin}
            onCheckedChange={setIsAdmin}
          />
          <Label htmlFor="role-toggle" className={isAdmin ? 'text-white' : 'text-gray-400'}>
            Admin
          </Label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="bg-[#0B0F17] border-gray-700"
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="bg-[#0B0F17] border-gray-700"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="link"
              onClick={() => handleResetPassword(formData.email)}
              className="text-sm text-blue-500 hover:text-blue-400"
              disabled={isLoading}
            >
              Esqueceu a senha?
            </Button>
            <Button
              type="button"
              variant="link"
              onClick={() => navigate('/register')}
              className="text-sm text-blue-500 hover:text-blue-400"
              disabled={isLoading}
            >
              Criar conta
            </Button>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Carregando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Login; 