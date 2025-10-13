import { create } from 'zustand';

export interface OrderItemCustomization {
  customizationId: string;
  customizationName: string;
  optionName: string;
  price: number;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  customizations?: OrderItemCustomization[];
}

export interface OrderLine {
  id: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
  notes?: string;
}

export interface Order {
  id: string;
  branchId: string;
  branchName: string;
  guestName: string;
  guestPhone: string;
  tableNumber?: string;
  orderLines: OrderLine[];
  total: number;
  createdAt: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  billed?: boolean;
  billedAt?: string;
}

interface OrderState {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'status' | 'createdAt' | 'total'>) => void;
  addOrderLine: (orderId: string, orderLine: Omit<OrderLine, 'id' | 'createdAt'>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  markOrderAsBilled: (orderId: string) => void;
  getOrdersByBranch: (branchId?: string) => Order[];
  getOrdersByTable: (branchId: string, tableNumber: string) => Order[];
  getActiveOrderByTable: (branchId: string, tableNumber: string) => Order | undefined;
  getPendingOrders: (branchId?: string) => Order[];
  getCompletedUnbilledOrders: (branchId: string, tableNumber?: string) => Order[];
}

const STORAGE_KEY = 'mock_orders';

const saveOrders = (orders: Order[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
};

const loadOrders = (): Order[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: loadOrders(),

  addOrder: (orderData) =>
    set((state) => {
      const total = orderData.orderLines.reduce((sum, line) => sum + line.total, 0);
      const newOrder: Order = {
        ...orderData,
        id: Date.now().toString(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        total,
      };
      const updated = [newOrder, ...state.orders];
      saveOrders(updated);
      localStorage.setItem('order_notification', JSON.stringify(newOrder));
      return { orders: updated };
    }),

  addOrderLine: (orderId, orderLineData) =>
    set((state) => {
      const updated = state.orders.map((o) => {
        if (o.id === orderId) {
          const newOrderLine: OrderLine = {
            ...orderLineData,
            id: `${orderId}-line-${Date.now()}`,
            createdAt: new Date().toISOString(),
          };
          const updatedOrderLines = [...o.orderLines, newOrderLine];
          const newTotal = updatedOrderLines.reduce((sum, line) => sum + line.total, 0);
          return {
            ...o,
            orderLines: updatedOrderLines,
            total: newTotal,
          };
        }
        return o;
      });
      saveOrders(updated);
      return { orders: updated };
    }),

  updateOrderStatus: (orderId, status) =>
    set((state) => {
      const updated = state.orders.map((o) =>
        o.id === orderId ? { ...o, status } : o
      );
      saveOrders(updated);
      return { orders: updated };
    }),

  markOrderAsBilled: (orderId) =>
    set((state) => {
      const updated = state.orders.map((o) =>
        o.id === orderId ? { ...o, billed: true, billedAt: new Date().toISOString() } : o
      );
      saveOrders(updated);
      return { orders: updated };
    }),

  getOrdersByBranch: (branchId) => {
    const allOrders = loadOrders();
    if (!branchId) return allOrders;
    return allOrders.filter((order) => order.branchId === branchId);
  },

  getOrdersByTable: (branchId, tableNumber) => {
    const allOrders = loadOrders();
    return allOrders.filter((order) => 
      order.branchId === branchId && order.tableNumber === tableNumber
    );
  },

  getActiveOrderByTable: (branchId, tableNumber) => {
    const { orders } = get();
    return orders.find((o) => 
      o.branchId === branchId && 
      o.tableNumber === tableNumber && 
      !o.billed &&
      o.status !== 'cancelled'
    );
  },

  getPendingOrders: (branchId) => {
    const { orders } = get();
    const filtered = branchId 
      ? orders.filter((o) => o.branchId === branchId && o.status === 'pending')
      : orders.filter((o) => o.status === 'pending');
    return filtered;
  },

  getCompletedUnbilledOrders: (branchId, tableNumber) => {
    const { orders } = get();
    return orders.filter((o) => 
      o.branchId === branchId && 
      o.status === 'completed' && 
      !o.billed &&
      (tableNumber ? o.tableNumber === tableNumber : true)
    );
  },
}));
