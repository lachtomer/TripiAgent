import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';

export type BankPlace = {
  name: string;
  category?: string;
  description?: string;
  lat?: number;
  lng?: number;
  createdBy?: string;
};

type BankState = {
  places: BankPlace[];
  load: () => Promise<void>;
  add: (newPlaces: BankPlace[]) => Promise<void>;
  remove: (index: number, requestedBy: string) => Promise<void>;
  clear: () => void;
};

export const useBankStore = create<BankState>()(
  devtools(
    persist((set, get) => ({
      places: [],
      load: async () => {
        try {
          const res = await fetch('/api/bank/places');
          if (!res.ok) throw new Error('Failed to load bank places');
          const { places } = await res.json();
          set({ places });
        } catch (e) {
          console.error(e);
        }
      },
      add: async (newPlaces) => {
        const res = await fetch('/api/bank/places', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ places: newPlaces }),
        });
        if (!res.ok) throw new Error('Failed to save bank places');
        await get().load();
      },
      remove: async (index, requestedBy) => {
        const res = await fetch('/api/bank/places', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ index, requestedBy }),
        });
        if (res.status === 403) {
          throw new Error('Only bank admins can delete entries');
        }
        if (!res.ok) throw new Error('Failed to delete bank place');
        await get().load();
      },
      clear: () => set({ places: [] })
    }), {
      name: 'bank-store', // storage key
      // ensure JSON serialization works
      storage: createJSONStorage(() => localStorage)
    })
  )
);
