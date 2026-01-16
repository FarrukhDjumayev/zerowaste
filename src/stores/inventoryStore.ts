import { create } from 'zustand';

export interface FoodItem {
  id: string;
  user_id: string;
  name: string;
  quantity: number;
  unit: string;
  expiry_date: string;
  freshness_score: number;
  category: string;
  image_url?: string;
  scanned_at?: string;
  created_at: string;
  updated_at: string;
}

interface InventoryState {
  items: FoodItem[];
  isLoading: boolean;
  filter: 'all' | 'fresh' | 'expiring' | 'expired';
  setItems: (items: FoodItem[]) => void;
  addItem: (item: FoodItem) => void;
  updateItem: (id: string, updates: Partial<FoodItem>) => void;
  removeItem: (id: string) => void;
  setFilter: (filter: 'all' | 'fresh' | 'expiring' | 'expired') => void;
  setLoading: (loading: boolean) => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  items: [],
  isLoading: false,
  filter: 'all',

  setItems: (items) => set({ items }),
  
  addItem: (item) => set((state) => ({ 
    items: [item, ...state.items] 
  })),
  
  updateItem: (id, updates) => set((state) => ({
    items: state.items.map((item) => 
      item.id === id ? { ...item, ...updates } : item
    ),
  })),
  
  removeItem: (id) => set((state) => ({
    items: state.items.filter((item) => item.id !== id),
  })),
  
  setFilter: (filter) => set({ filter }),
  
  setLoading: (isLoading) => set({ isLoading }),
}));
