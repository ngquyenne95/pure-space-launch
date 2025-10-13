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

interface CustomizationState {
  customizations: Customization[];
  categoryCustomizations: CategoryCustomization[];
  menuItemCustomizations: MenuItemCustomization[];
  
  // Customization CRUD
  addCustomization: (customization: Omit<Customization, 'id' | 'createdAt'>) => void;
  updateCustomization: (id: string, updates: Partial<Customization>) => void;
  deleteCustomization: (id: string) => void;
  getCustomizationsByBranch: (branchId: string) => Customization[];
  
  // Category customization links
  linkCategoryCustomization: (categoryName: string, customizationId: string, branchId: string) => void;
  unlinkCategoryCustomization: (categoryName: string, customizationId: string, branchId: string) => void;
  getCategoryCustomizations: (categoryName: string, branchId: string) => Customization[];
  
  // Menu item customization links
  linkMenuItemCustomization: (menuItemId: string, customizationId: string) => void;
  unlinkMenuItemCustomization: (menuItemId: string, customizationId: string) => void;
  getMenuItemCustomizations: (menuItemId: string) => Customization[];
}

const STORAGE_KEY_CUSTOMIZATIONS = 'customizations';
const STORAGE_KEY_CATEGORY_CUSTOMIZATIONS = 'category_customizations';
const STORAGE_KEY_MENUITEM_CUSTOMIZATIONS = 'menuitem_customizations';

const loadCustomizations = (): Customization[] => {
  const stored = localStorage.getItem(STORAGE_KEY_CUSTOMIZATIONS);
  return stored ? JSON.parse(stored) : [];
};

const loadCategoryCustomizations = (): CategoryCustomization[] => {
  const stored = localStorage.getItem(STORAGE_KEY_CATEGORY_CUSTOMIZATIONS);
  return stored ? JSON.parse(stored) : [];
};

const loadMenuItemCustomizations = (): MenuItemCustomization[] => {
  const stored = localStorage.getItem(STORAGE_KEY_MENUITEM_CUSTOMIZATIONS);
  return stored ? JSON.parse(stored) : [];
};

const saveCustomizations = (customizations: Customization[]) => {
  localStorage.setItem(STORAGE_KEY_CUSTOMIZATIONS, JSON.stringify(customizations));
};

const saveCategoryCustomizations = (links: CategoryCustomization[]) => {
  localStorage.setItem(STORAGE_KEY_CATEGORY_CUSTOMIZATIONS, JSON.stringify(links));
};

const saveMenuItemCustomizations = (links: MenuItemCustomization[]) => {
  localStorage.setItem(STORAGE_KEY_MENUITEM_CUSTOMIZATIONS, JSON.stringify(links));
};

export const useCustomizationStore = create<CustomizationState>((set, get) => ({
  customizations: loadCustomizations(),
  categoryCustomizations: loadCategoryCustomizations(),
  menuItemCustomizations: loadMenuItemCustomizations(),

  addCustomization: (customization) => {
    const newCustomization: Customization = {
      ...customization,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const customizations = [...get().customizations, newCustomization];
    saveCustomizations(customizations);
    set({ customizations });
  },

  updateCustomization: (id, updates) => {
    const customizations = get().customizations.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    );
    saveCustomizations(customizations);
    set({ customizations });
  },

  deleteCustomization: (id) => {
    const customizations = get().customizations.filter((c) => c.id !== id);
    saveCustomizations(customizations);
    set({ customizations });
  },

  getCustomizationsByBranch: (branchId) => {
    return get().customizations.filter((c) => c.branchId === branchId);
  },

  linkCategoryCustomization: (categoryName, customizationId, branchId) => {
    const links = get().categoryCustomizations;
    const exists = links.find(
      (l) => l.categoryName === categoryName && l.customizationId === customizationId && l.branchId === branchId
    );
    if (!exists) {
      const newLink: CategoryCustomization = {
        id: Date.now().toString(),
        categoryName,
        customizationId,
        branchId,
      };
      const newLinks = [...links, newLink];
      saveCategoryCustomizations(newLinks);
      set({ categoryCustomizations: newLinks });
    }
  },

  unlinkCategoryCustomization: (categoryName, customizationId, branchId) => {
    const links = get().categoryCustomizations.filter(
      (l) => !(l.categoryName === categoryName && l.customizationId === customizationId && l.branchId === branchId)
    );
    saveCategoryCustomizations(links);
    set({ categoryCustomizations: links });
  },

  getCategoryCustomizations: (categoryName, branchId) => {
    const links = get().categoryCustomizations.filter(
      (l) => l.categoryName === categoryName && l.branchId === branchId
    );
    const customizations = get().customizations;
    return links.map((l) => customizations.find((c) => c.id === l.customizationId)).filter(Boolean) as Customization[];
  },

  linkMenuItemCustomization: (menuItemId, customizationId) => {
    const links = get().menuItemCustomizations;
    const exists = links.find(
      (l) => l.menuItemId === menuItemId && l.customizationId === customizationId
    );
    if (!exists) {
      const newLink: MenuItemCustomization = {
        id: Date.now().toString(),
        menuItemId,
        customizationId,
      };
      const newLinks = [...links, newLink];
      saveMenuItemCustomizations(newLinks);
      set({ menuItemCustomizations: newLinks });
    }
  },

  unlinkMenuItemCustomization: (menuItemId, customizationId) => {
    const links = get().menuItemCustomizations.filter(
      (l) => !(l.menuItemId === menuItemId && l.customizationId === customizationId)
    );
    saveMenuItemCustomizations(links);
    set({ menuItemCustomizations: links });
  },

  getMenuItemCustomizations: (menuItemId) => {
    const links = get().menuItemCustomizations.filter((l) => l.menuItemId === menuItemId);
    const customizations = get().customizations;
    return links.map((l) => customizations.find((c) => c.id === l.customizationId)).filter(Boolean) as Customization[];
  },
}));
