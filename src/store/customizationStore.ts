import { create } from 'zustand';

export interface Customization {
  id: string;
  branchId: string;
  name: string;
  price: number;
  createdAt: string;
}

export interface CategoryCustomization {
  id: string;
  categoryName: string;
  customizationId: string;
  branchId: string;
}

export interface MenuItemCustomization {
  id: string;
  menuItemId: string;
  customizationId: string;
}

export interface MenuItem {
  id: string;
  branchId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  parentCategory?: string;
  imageUrl?: string;
  available: boolean;
  customizations: Customization[]; // đồng bộ từ CustomizationStore
  createdAt: string;
}

interface MenuCustomizationState {
  customizations: Customization[];
  categoryCustomizations: CategoryCustomization[];
  menuItemCustomizations: MenuItemCustomization[];
  menuItems: MenuItem[];

  // --- Customization CRUD ---
  addCustomization: (customization: Omit<Customization, 'id' | 'createdAt'>) => void;
  updateCustomization: (id: string, updates: Partial<Customization>) => void;
  deleteCustomization: (id: string) => void;

  // --- Category & MenuItem link ---
  linkCategoryCustomization: (categoryName: string, customizationId: string, branchId: string) => void;
  unlinkCategoryCustomization: (categoryName: string, customizationId: string, branchId: string) => void;

  linkMenuItemCustomization: (menuItemId: string, customizationId: string) => void;
  unlinkMenuItemCustomization: (menuItemId: string, customizationId: string) => void;

  // --- MenuItem CRUD ---
  addMenuItem: (item: Omit<MenuItem, 'id' | 'createdAt' | 'customizations'>) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;

  getMenuItemsByBranch: (branchId: string) => MenuItem[];
  getMenuItemById: (id: string) => MenuItem | undefined;
}

// ---------- LocalStorage helpers ----------
const STORAGE_KEYS = {
  CUSTOMIZATIONS: 'customizations',
  CATEGORY_CUSTOMIZATIONS: 'category_customizations',
  MENUITEM_CUSTOMIZATIONS: 'menuitem_customizations',
  MENU_ITEMS: 'menu_items',
};

const load = <T>(key: string): T[] => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
};

const save = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// ---------- Store ----------
export const useCustomizationStore = create<MenuCustomizationState>((set, get) => ({
  customizations: load<Customization>(STORAGE_KEYS.CUSTOMIZATIONS),
  categoryCustomizations: load<CategoryCustomization>(STORAGE_KEYS.CATEGORY_CUSTOMIZATIONS),
  menuItemCustomizations: load<MenuItemCustomization>(STORAGE_KEYS.MENUITEM_CUSTOMIZATIONS),
  menuItems: load<MenuItem>(STORAGE_KEYS.MENU_ITEMS),

  // --- Customization CRUD ---
  addCustomization: (customization) => {
    const newCust: Customization = { ...customization, id: Date.now().toString(), createdAt: new Date().toISOString() };
    const customizations = [...get().customizations, newCust];
    save(STORAGE_KEYS.CUSTOMIZATIONS, customizations);
    set({ customizations });
  },

  updateCustomization: (id, updates) => {
    const customizations = get().customizations.map(c => c.id === id ? { ...c, ...updates } : c);
    save(STORAGE_KEYS.CUSTOMIZATIONS, customizations);

    // Đồng bộ menuItems liên quan
    const menuItems = get().menuItems.map(item => ({
      ...item,
      customizations: item.customizations.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
    save(STORAGE_KEYS.MENU_ITEMS, menuItems);

    set({ customizations, menuItems });
  },

  deleteCustomization: (id) => {
    const customizations = get().customizations.filter(c => c.id !== id);
    save(STORAGE_KEYS.CUSTOMIZATIONS, customizations);

    // Xóa trong category link
    const categoryCustomizations = get().categoryCustomizations.filter(l => l.customizationId !== id);
    save(STORAGE_KEYS.CATEGORY_CUSTOMIZATIONS, categoryCustomizations);

    // Xóa trong menuItem link
    const menuItemCustomizations = get().menuItemCustomizations.filter(l => l.customizationId !== id);
    save(STORAGE_KEYS.MENUITEM_CUSTOMIZATIONS, menuItemCustomizations);

    // Xóa trong menuItems
    const menuItems = get().menuItems.map(item => ({
      ...item,
      customizations: item.customizations.filter(c => c.id !== id)
    }));
    save(STORAGE_KEYS.MENU_ITEMS, menuItems);

    set({ customizations, categoryCustomizations, menuItemCustomizations, menuItems });
  },

  // --- Category link ---
  linkCategoryCustomization: (categoryName, customizationId, branchId) => {
    const exists = get().categoryCustomizations.find(l => l.categoryName === categoryName && l.customizationId === customizationId && l.branchId === branchId);
    if (!exists) {
      const newLink: CategoryCustomization = { id: Date.now().toString(), categoryName, customizationId, branchId };
      const categoryCustomizations = [...get().categoryCustomizations, newLink];
      save(STORAGE_KEYS.CATEGORY_CUSTOMIZATIONS, categoryCustomizations);
      set({ categoryCustomizations });
    }
  },

  unlinkCategoryCustomization: (categoryName, customizationId, branchId) => {
    const categoryCustomizations = get().categoryCustomizations.filter(l => !(l.categoryName === categoryName && l.customizationId === customizationId && l.branchId === branchId));
    save(STORAGE_KEYS.CATEGORY_CUSTOMIZATIONS, categoryCustomizations);
    set({ categoryCustomizations });
  },

  // --- MenuItem link ---
  linkMenuItemCustomization: (menuItemId, customizationId) => {
    const exists = get().menuItemCustomizations.find(l => l.menuItemId === menuItemId && l.customizationId === customizationId);
    if (!exists) {
      const newLink: MenuItemCustomization = { id: Date.now().toString(), menuItemId, customizationId };
      const menuItemCustomizations = [...get().menuItemCustomizations, newLink];
      save(STORAGE_KEYS.MENUITEM_CUSTOMIZATIONS, menuItemCustomizations);

      // Đồng bộ vào menuItem.customizations
      const cust = get().customizations.find(c => c.id === customizationId);
      if (cust) {
        const menuItems = get().menuItems.map(item => {
          if (item.id === menuItemId) {
            return { ...item, customizations: [...item.customizations, cust] };
          }
          return item;
        });
        save(STORAGE_KEYS.MENU_ITEMS, menuItems);
        set({ menuItems });
      }

      set({ menuItemCustomizations });
    }
  },

  unlinkMenuItemCustomization: (menuItemId, customizationId) => {
    const menuItemCustomizations = get().menuItemCustomizations.filter(l => !(l.menuItemId === menuItemId && l.customizationId === customizationId));
    save(STORAGE_KEYS.MENUITEM_CUSTOMIZATIONS, menuItemCustomizations);

    // Đồng bộ xóa trong menuItem.customizations
    const menuItems = get().menuItems.map(item => ({
      ...item,
      customizations: item.customizations.filter(c => !(c.id === customizationId))
    }));
    save(STORAGE_KEYS.MENU_ITEMS, menuItems);

    set({ menuItemCustomizations, menuItems });
  },

  // --- MenuItem CRUD ---
  addMenuItem: (item) => {
    const newItem: MenuItem = { ...item, id: Date.now().toString(), createdAt: new Date().toISOString(), customizations: [] };
    const menuItems = [...get().menuItems, newItem];
    save(STORAGE_KEYS.MENU_ITEMS, menuItems);
    set({ menuItems });
  },

  updateMenuItem: (id, updates) => {
    const menuItems = get().menuItems.map(item => item.id === id ? { ...item, ...updates } : item);
    save(STORAGE_KEYS.MENU_ITEMS, menuItems);
    set({ menuItems });
  },

  deleteMenuItem: (id) => {
    const menuItems = get().menuItems.filter(item => item.id !== id);
    save(STORAGE_KEYS.MENU_ITEMS, menuItems);

    // Xóa liên kết menuItemCustomizations
    const menuItemCustomizations = get().menuItemCustomizations.filter(l => l.menuItemId !== id);
    save(STORAGE_KEYS.MENUITEM_CUSTOMIZATIONS, menuItemCustomizations);

    set({ menuItems, menuItemCustomizations });
  },

  getMenuItemsByBranch: (branchId) => get().menuItems.filter(item => item.branchId === branchId),

  getMenuItemById: (id) => get().menuItems.find(item => item.id === id),
}));
