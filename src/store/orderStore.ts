import { create } from 'zustand';

export interface OrderItemCustomization {
  id: string; // order_item_customization_id
  customizationId: string;
  name: string;
  quantity: number;
  totalPrice: number;
}

export interface OrderItem {
  id: string; // order_item_id
  menuItemId: string;
  name: string;
  quantity: number;
  totalPrice: number;
  note?: string;
  customizations?: OrderItemCustomization[];
}

export interface OrderLine {
  id: string; // order_line_id
  orderLineStatus: 'pending' | 'preparing' | 'ready' | 'completed';
  createdAt: string;
  updatedAt?: string;
  items: OrderItem[];
}

export interface Order {
  id: string; // order_id
  areaTableId: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  totalPrice: number;
  createdAt: string;
  updatedAt?: string;
  orderLines: OrderLine[];
}

interface OrderState {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'totalPrice'>) => void;
  addOrderLine: (orderId: string, line: Omit<OrderLine, 'id' | 'createdAt'>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  getOrdersByTable: (tableId: string) => Order[];
  getPendingOrders: (tableId?: string) => Order[];
}

const STORAGE_KEY = 'mock_orders';
const saveOrders = (orders: Order[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
const loadOrders = (): Order[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: loadOrders(),

  addOrder: (orderData) => {
    const menuStore = useMenuCustomizationStore.getState();

    // Map items từ menu để tính totalPrice và customizations
    const mappedLines: OrderLine[] = orderData.orderLines.map(line => {
      const mappedItems: OrderItem[] = line.items.map(item => {
        const menuItem = menuStore.getMenuItemById(item.menuItemId);
        if (!menuItem) throw new Error(`MenuItem ${item.menuItemId} not found`);

        const mappedCustomizations: OrderItemCustomization[] = (item.customizations || []).map(cust => {
          const menuCust = menuItem.customizations.find(mc => mc.id === cust.customizationId);
          if (!menuCust) throw new Error(`Customization ${cust.customizationId} not found`);
          return {
            id: Date.now().toString() + Math.random().toString(36).substring(2),
            customizationId: menuCust.id,
            name: menuCust.name,
            quantity: cust.quantity,
            totalPrice: menuCust.price * cust.quantity
          };
        });

        const totalPrice = menuItem.price * item.quantity + mappedCustomizations.reduce((sum, c) => sum + c.totalPrice, 0);
        return {
          ...item,
          id: Date.now().toString() + Math.random().toString(36).substring(2),
          name: menuItem.name,
          totalPrice,
          customizations: mappedCustomizations
        };
      });

      return {
        ...line,
        id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
        createdAt: new Date().toISOString(),
        items: mappedItems
      };
    });

    const totalPrice = mappedLines.reduce(
      (sum, line) => sum + line.items.reduce((itemSum, i) => itemSum + i.totalPrice, 0),
      0
    );

    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      totalPrice,
      orderLines: mappedLines
    };

    const updated = [newOrder, ...get().orders];
    saveOrders(updated);
    set({ orders: updated });
  },

  addOrderLine: (orderId, lineData) => {
    const menuStore = useMenuCustomizationStore.getState();

    const mappedItems: OrderItem[] = lineData.items.map(item => {
      const menuItem = menuStore.getMenuItemById(item.menuItemId);
      if (!menuItem) throw new Error(`MenuItem ${item.menuItemId} not found`);

      const mappedCustomizations: OrderItemCustomization[] = (item.customizations || []).map(cust => {
        const menuCust = menuItem.customizations.find(mc => mc.id === cust.customizationId);
        if (!menuCust) throw new Error(`Customization ${cust.customizationId} not found`);
        return {
          id: Date.now().toString() + Math.random().toString(36).substring(2),
          customizationId: menuCust.id,
          name: menuCust.name,
          quantity: cust.quantity,
          totalPrice: menuCust.price * cust.quantity
        };
      });

      const totalPrice = menuItem.price * item.quantity + mappedCustomizations.reduce((sum, c) => sum + c.totalPrice, 0);
      return {
        ...item,
        id: Date.now().toString() + Math.random().toString(36).substring(2),
        name: menuItem.name,
        totalPrice,
        customizations: mappedCustomizations
      };
    });

    const newLine: OrderLine = {
      ...lineData,
      id: `${orderId}-line-${Date.now()}`,
      createdAt: new Date().toISOString(),
      items: mappedItems
    };

    const updated = get().orders.map(o => {
      if (o.id === orderId) {
        const newTotal = o.totalPrice + mappedItems.reduce((sum, i) => sum + i.totalPrice, 0);
        return { ...o, orderLines: [...o.orderLines, newLine], totalPrice: newTotal };
      }
      return o;
    });

    saveOrders(updated);
    set({ orders: updated });
  },

  updateOrderStatus: (orderId, status) => {
    const updated = get().orders.map(o => (o.id === orderId ? { ...o, status } : o));
    saveOrders(updated);
    set({ orders: updated });
  },

  getOrdersByTable: (tableId) => get().orders.filter(o => o.areaTableId === tableId),
  getPendingOrders: (tableId) => get().orders.filter(o => o.status === 'pending' && (tableId ? o.areaTableId === tableId : true))
}));
