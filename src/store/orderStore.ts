import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface OrderState {
  albumSize: string | null
  numberOfPages: number | null
  finishType: string | null
  caseType: string | null
  totalPrice: number
  setAlbumSize: (size: string) => void
  setNumberOfPages: (pages: number) => void
  setFinishType: (finish: string) => void
  setCaseType: (caseType: string) => void
  setTotalPrice: (price: number) => void
  resetOrder: () => void
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      albumSize: null,
      numberOfPages: null,
      finishType: null,
      caseType: null,
      totalPrice: 0,
      setAlbumSize: (size) => set({ albumSize: size }),
      setNumberOfPages: (pages) => set({ numberOfPages: pages }),
      setFinishType: (finish) => set({ finishType: finish }),
      setCaseType: (caseType) => set({ caseType: caseType }),
      setTotalPrice: (price) => set({ totalPrice: price }),
      resetOrder: () => set({
        albumSize: null,
        numberOfPages: null,
        finishType: null,
        caseType: null,
        totalPrice: 0
      })
    }),
    {
      name: 'order-storage'
    }
  )
) 