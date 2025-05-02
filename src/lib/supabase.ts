import { createClient } from '@supabase/supabase-js'

// Obtenha a URL e a chave anônima das variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Valide se as variáveis de ambiente estão definidas
if (!supabaseUrl) {
  throw new Error("Missing env.VITE_SUPABASE_URL")
}
if (!supabaseAnonKey) {
  throw new Error("Missing env.VITE_SUPABASE_ANON_KEY")
}

// Configurações do cliente Supabase
const supabaseOptions = {
  auth: {
    persistSession: true, // Ativa persistência de sessão
    storageKey: 'app-supabase-auth', // Chave única para storage
    autoRefreshToken: true, // Ativa refresh automático do token
    detectSessionInUrl: true // Detecta sessão na URL
  }
}

// Crie e exporte o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions) 