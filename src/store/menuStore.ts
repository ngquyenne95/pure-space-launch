import { create } from 'zustand';

export interface MenuCustomization {
  id: string;
  name: string;
  options: { name: string; price: number }[];
}

export interface MenuItem {
  id: string;
  branchId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  parentCategory?: string; // For customization categories
  isCustomizationCategory?: boolean;
  imageUrl?: string;
  available: boolean;
  customizations?: MenuCustomization[];
  createdAt: string;
}

interface MenuState {
  items: MenuItem[];
  addItem: (item: Omit<MenuItem, 'id' | 'createdAt'>) => void;
  updateItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteItem: (id: string) => void;
  getItemsByBranch: (branchId: string) => MenuItem[];
  getItemById: (id: string) => MenuItem | undefined;
}

const STORAGE_KEY = 'menu_items';

const loadItems = (): MenuItem[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveItems = (items: MenuItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const useMenuStore = create<MenuState>((set, get) => ({
  items: loadItems(),

  addItem: (item) => {
    const newItem: MenuItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const items = [...get().items, newItem];
    saveItems(items);
    set({ items });
  },

  updateItem: (id, updates) => {
    const items = get().items.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    saveItems(items);
    set({ items });
  },

  deleteItem: (id) => {
    const items = get().items.filter((item) => item.id !== id);
    saveItems(items);
    set({ items });
  },

  getItemsByBranch: (branchId) => {
    return get().items.filter((item) => item.branchId === branchId);
  },

  getItemById: (id) => {
    return get().items.find((item) => item.id === id);
  },
}));
