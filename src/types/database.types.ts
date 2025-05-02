export interface Album {
  id: number
  nome: string
  valor_base: number
  reajuste_base: number
  reajuste_lamina: number
  created_at: string
  updated_at: string
}

export interface ImagemAlbum {
  id: number
  album_id: number
  url: string
  created_at: string
} 