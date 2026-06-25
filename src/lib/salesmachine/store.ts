'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SalesmachineStore {
  activeProjectId: string | null
  setActiveProjectId: (id: string | null) => void
}

export const useSalesmachineStore = create<SalesmachineStore>()(
  persist(
    (set) => ({
      activeProjectId: null,
      setActiveProjectId: (id) => set({ activeProjectId: id }),
    }),
    { name: 'salesmachine-store' }
  )
)
