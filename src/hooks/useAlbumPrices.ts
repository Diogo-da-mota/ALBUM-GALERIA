import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

interface AlbumData {
  id: string
  title: string
  price: number
  reajuste_base: number
  reajuste_lamina: number
  image_urls: string[] | null
}

interface AlbumPricesStore {
  prices: AlbumData[]
  setPrices: (prices: AlbumData[]) => void
  updateValorBase: (id: string, newValorBase: number) => Promise<void>
  updateReajusteBase: (id: string, newReajuste: number) => Promise<void>
  updateReajusteLamina: (id: string, newReajuste: number) => Promise<void>
  fetchSingleAlbumPrice: (id: string) => Promise<void>
  fetchPrices: () => Promise<void>
  updateAlbumImageUrls: (id: string, urls: string[] | null) => void
}

export const useAlbumPrices = create<AlbumPricesStore>((set, get) => ({
  prices: [],
  setPrices: (prices) => set({ prices }),

  updateValorBase: async (id: string, newValorBase: number) => {
    try {
      // Validar valor
      if (isNaN(newValorBase) || newValorBase <= 0) {
        throw new Error('Valor base inválido')
      }

      const { error } = await supabase
        .from('albums')
        .update({ valor_base: newValorBase })
        .eq('id', id)

      if (error) {
        console.error('Erro Supabase (updateValorBase):', error)
        throw error
      }

      // Atualizar apenas o valor_base no estado local
      set((state) => ({
        prices: state.prices.map(p =>
          p.id === id ? { ...p, price: newValorBase } : p
        )
      }))
    } catch (error) {
      console.error('Erro ao atualizar valor base:', error)
      throw error
    }
  },

  updateReajusteBase: async (id: string, newReajuste: number) => {
    try {
      // Validar reajuste
      if (isNaN(newReajuste)) {
        throw new Error('Valor de reajuste inválido')
      }

      const { error } = await supabase
        .from('albums')
        .update({ reajuste_base: newReajuste })
        .eq('id', id)

      if (error) {
        console.error('Erro Supabase (updateReajusteBase):', error)
        throw error
      }

      // Atualizar apenas o reajuste_base no estado local
      set((state) => ({
        prices: state.prices.map(p =>
          p.id === id ? { ...p, reajuste_base: newReajuste } : p
        )
      }))
    } catch (error) {
      console.error('Erro ao atualizar reajuste base:', error)
      throw error
    }
  },

  updateReajusteLamina: async (id: string, newReajuste: number) => {
    try {
      // Validar reajuste
      if (isNaN(newReajuste)) {
        throw new Error('Valor de reajuste de lâmina inválido')
      }

      const { error } = await supabase
        .from('albums')
        .update({ reajuste_lamina: newReajuste })
        .eq('id', id)

      if (error) {
        console.error('Erro Supabase (updateReajusteLamina):', error)
        throw error
      }

      // Atualizar apenas o reajuste_lamina no estado local
      set((state) => ({
        prices: state.prices.map(p =>
          p.id === id ? { ...p, reajuste_lamina: newReajuste } : p
        )
      }))
    } catch (error) {
      console.error('Erro ao atualizar reajuste de lâmina:', error)
      throw error
    }
  },

  fetchSingleAlbumPrice: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('albums')
        .select('id, nome, valor_base, reajuste_base, reajuste_lamina, image_urls')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Erro Supabase (fetchSingleAlbumPrice):', error)
        throw error
      }

      if (data) {
        // Atualizar apenas o álbum específico no estado local
        set((state) => ({
          prices: state.prices.map(p =>
            p.id === id ? {
              ...p,
              price: data.valor_base,
              reajuste_base: data.reajuste_base || 0,
              reajuste_lamina: data.reajuste_lamina || 0,
              image_urls: data.image_urls
            } : p
          )
        }))
      }
    } catch (error) {
      console.error('Erro ao buscar preço individual:', error)
      throw error
    }
  },

  fetchPrices: async () => {
    try {
      const { data, error } = await supabase
        .from('albums')
        .select('id, nome, valor_base, reajuste_base, reajuste_lamina, image_urls')
        .order('nome')

      if (error) {
        console.error('Erro Supabase (fetchPrices):', error)
        throw error
      }

      if (data) {
        const mappedPrices: AlbumData[] = data.map(album => ({
          id: album.id,
          title: album.nome,
          price: album.valor_base,
          reajuste_base: album.reajuste_base || 0,
          reajuste_lamina: album.reajuste_lamina || 0,
          image_urls: album.image_urls
        }))
        set({ prices: mappedPrices })
      } else {
        set({ prices: [] })
      }
    } catch (error) {
      console.error('Erro ao buscar preços:', error)
      set({ prices: [] })
    }
  },

  updateAlbumImageUrls: (id: string, urls: string[] | null) => {
    set((state) => ({
      prices: state.prices.map(p => 
        p.id === id ? { ...p, image_urls: urls } : p
      )
    }))
  }
})) 