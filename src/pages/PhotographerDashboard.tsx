import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface Session {
  id: string;
  title: string;
  description: string;
  cover_image: string;
  created_at: string;
}

interface SessionPhoto {
  id: string;
  url: string;
  order_index: number;
}

export default function PhotographerDashboard() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [photos, setPhotos] = useState<SessionPhoto[]>([]);
  const [uploading, setUploading] = useState(false);

  // Buscar sessões do fotógrafo
  const fetchSessions = async () => {
    try {
      const { data: sessionsData, error } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(sessionsData || []);
    } catch (error: any) {
      toast.error('Erro ao carregar sessões');
      console.error('Erro:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Buscar fotos de uma sessão
  const fetchSessionPhotos = async (sessionId: string) => {
    try {
      const { data: photosData, error } = await supabase
        .from('session_photos')
        .select('*')
        .eq('session_id', sessionId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setPhotos(photosData || []);
    } catch (error: any) {
      toast.error('Erro ao carregar fotos');
      console.error('Erro:', error.message);
    }
  };

  // Carregar sessões ao montar o componente
  useEffect(() => {
    fetchSessions();
  }, []);

  // Funções de gerenciamento de sessões
  const handleEditSession = async (session: Session) => {
    setEditingSession(session);
    await fetchSessionPhotos(session.id);
  };

  const handleUpdateSession = async (sessionId: string, updates: Partial<Session>) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .update(updates)
        .eq('id', sessionId);

      if (error) throw error;
      
      toast.success('Sessão atualizada com sucesso!');
      fetchSessions();
      setEditingSession(null);
    } catch (error: any) {
      toast.error('Erro ao atualizar sessão');
      console.error('Erro:', error.message);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta sessão? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
      
      toast.success('Sessão excluída com sucesso!');
      fetchSessions();
    } catch (error: any) {
      toast.error('Erro ao excluir sessão');
      console.error('Erro:', error.message);
    }
  };

  // Upload de fotos
  const handlePhotoUpload = async (sessionId: string, file: File) => {
    try {
      setUploading(true);

      // 1. Upload do arquivo para o Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `photos/${sessionId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('session-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('session-photos')
        .getPublicUrl(filePath);

      // 3. Adicionar à tabela session_photos
      const { error: dbError } = await supabase
        .from('session_photos')
        .insert([
          {
            session_id: sessionId,
            url: publicUrl,
            order_index: photos.length // Adiciona ao final
          }
        ]);

      if (dbError) throw dbError;

      toast.success('Foto adicionada com sucesso!');
      fetchSessionPhotos(sessionId);
    } catch (error: any) {
      toast.error('Erro ao fazer upload da foto');
      console.error('Erro:', error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string, sessionId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta foto?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('session_photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;
      
      toast.success('Foto excluída com sucesso!');
      fetchSessionPhotos(sessionId);
    } catch (error: any) {
      toast.error('Erro ao excluir foto');
      console.error('Erro:', error.message);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      localStorage.removeItem('user');
      navigate('/');
    } catch (error: any) {
      toast.error('Erro ao fazer logout');
      console.error('Erro:', error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Minhas Sessões</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Sair
          </button>
        </div>

        {/* Lista de Sessões */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map(session => (
            <div key={session.id} className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <img
                src={session.cover_image}
                alt={session.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h2 className="text-xl font-semibold mb-2">{session.title}</h2>
              <p className="text-gray-400 mb-4">{session.description}</p>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditSession(session)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex-1"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteSession(session.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal de Edição */}
        {editingSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
              <h2 className="text-2xl font-bold mb-4">Editar Sessão</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título</label>
                  <input
                    type="text"
                    value={editingSession.title}
                    onChange={(e) => setEditingSession({
                      ...editingSession,
                      title: e.target.value
                    })}
                    className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <textarea
                    value={editingSession.description}
                    onChange={(e) => setEditingSession({
                      ...editingSession,
                      description: e.target.value
                    })}
                    className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Fotos</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {photos.map(photo => (
                      <div key={photo.id} className="relative">
                        <img
                          src={photo.url}
                          alt="Foto da sessão"
                          className="w-full h-32 object-cover rounded"
                        />
                        <button
                          onClick={() => handleDeletePhoto(photo.id, editingSession.id)}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    
                    {/* Input de Upload */}
                    <label className="relative border-2 border-dashed border-gray-600 rounded flex items-center justify-center cursor-pointer hover:border-indigo-500">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handlePhotoUpload(editingSession.id, file);
                          }
                        }}
                        disabled={uploading}
                      />
                      {uploading ? (
                        <svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={() => setEditingSession(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleUpdateSession(editingSession.id, {
                      title: editingSession.title,
                      description: editingSession.description
                    })}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 