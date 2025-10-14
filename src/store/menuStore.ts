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
  parentCategory?: string; // dùng để liên kết với category-level customizations
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

  addItemCustomization: (menuItemId: string, customization: Omit<MenuCustomization, 'id'>) => void;
  updateItemCustomization: (menuItemId: string, customizationId: string, updates: Partial<MenuCustomization>) => void;
  deleteItemCustomization: (menuItemId: string, customizationId: string) => void;

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
      customizations: [],
    };
    const items = [...get().items, newItem];
    saveItems(items);
    set({ items });
  },

  updateItem: (id, updates) => {
    const items = get().items.map(item => item.id === id ? { ...item, ...updates } : item);
    saveItems(items);
    set({ items });
  },

  deleteItem: (id) => {
    const items = get().items.filter(item => item.id !== id);
    saveItems(items);
    set({ items });
  },

  addItemCustomization: (menuItemId, customization) => {
    const items = get().items.map(item => {
      if (item.id === menuItemId) {
        const newCustomization: MenuCustomization = { ...customization, id: Date.now().toString() };
        return { ...item, customizations: [...(item.customizations || []), newCustomization] };
      }
      return item;
    });
    saveItems(items);
    set({ items });
  },

  updateItemCustomization: (menuItemId, customizationId, updates) => {
    const items = get().items.map(item => {
      if (item.id === menuItemId && item.customizations) {
        return {
          ...item,
          customizations: item.customizations.map(c => c.id === customizationId ? { ...c, ...updates } : c)
        };
      }
      return item;
    });
    saveItems(items);
    set({ items });
  },

  deleteItemCustomization: (menuItemId, customizationId) => {
    const items = get().items.map(item => {
      if (item.id === menuItemId && item.customizations) {
        return {
          ...item,
          customizations: item.customizations.filter(c => c.id !== customizationId)
        };
      }
      return item;
    });
    saveItems(items);
    set({ items });
  },

  getItemsByBranch: (branchId) => get().items.filter(item => item.branchId === branchId),
  getItemById: (id) => get().items.find(item => item.id === id),
}));
