import { seedReservations } from './seedReservations';

// Seed branch data for menu, tables, staff if not present
export function seedBranchData(branchId: string) {
  // Seed reservations
  seedReservations(branchId);
  
  // Seed menu items
  const menuKey = 'menu_items';
  let menu = JSON.parse(localStorage.getItem(menuKey) || '[]');
  if (!menu.some((item: any) => item.branchId === branchId)) {
    const branchMenu = mockMenuItems.map(item => ({
      ...item,
      branchId,
      id: `${branchId}-menu-${item.id}`,
      createdAt: new Date().toISOString(),
    }));
    menu = [...menu, ...branchMenu];
    localStorage.setItem(menuKey, JSON.stringify(menu));
  }

  // Seed tables
  const tableKey = 'tables';
  let tables = JSON.parse(localStorage.getItem(tableKey) || '[]');
  if (!tables.some((t: any) => t.branchId === branchId)) {
    const branchTables = mockTables.map(table => ({
      ...table,
      branchId,
      id: `${branchId}-table-${table.id}`,
      createdAt: new Date().toISOString(),
    }));
    tables = [...tables, ...branchTables];
    localStorage.setItem(tableKey, JSON.stringify(tables));
  }

  // Seed staff
  const staffKey = 'staff_members';
  let staff = JSON.parse(localStorage.getItem(staffKey) || '[]');
  if (!staff.some((s: any) => s.branchId === branchId)) {
    const branchStaff = mockStaff.map(staff => ({
      ...staff,
      branchId,
      id: `${branchId}-staff-${staff.id}`,
      createdAt: new Date().toISOString(),
    }));
    staff = [...staff, ...branchStaff];
    localStorage.setItem(staffKey, JSON.stringify(staff));
  }
}
// Initialize localStorage with mock data on app load
import { 
  mockBranches, 
  mockMenuItems, 
  mockTables, 
  mockOrders, 
  mockStaff,
  mockBrands,
  mockUsers
} from '@/data/mockData';

export const initializeMockData = () => {
  // Only initialize if not already present
  if (!localStorage.getItem('mock_branches')) {
    localStorage.setItem('mock_branches', JSON.stringify(mockBranches));
  }
  if (!localStorage.getItem('mock_menu_items')) {
    localStorage.setItem('mock_menu_items', JSON.stringify(mockMenuItems));
  }
  if (!localStorage.getItem('mock_tables')) {
    localStorage.setItem('mock_tables', JSON.stringify(mockTables));
  }
  if (!localStorage.getItem('mock_orders')) {
    localStorage.setItem('mock_orders', JSON.stringify(mockOrders));
  }
  if (!localStorage.getItem('mock_staff')) {
    localStorage.setItem('mock_staff', JSON.stringify(mockStaff));
  }
  if (!localStorage.getItem('mock_brands')) {
    localStorage.setItem('mock_brands', JSON.stringify(mockBrands));
  }
  if (!localStorage.getItem('mock_users')) {
    localStorage.setItem('mock_users', JSON.stringify(mockUsers));
  }
  
  // Initialize new store systems with mock data
  if (!localStorage.getItem('tables')) {
    localStorage.setItem('tables', JSON.stringify(mockTables));
  }
  if (!localStorage.getItem('menu_items')) {
    localStorage.setItem('menu_items', JSON.stringify(mockMenuItems));
  }
  if (!localStorage.getItem('staff_members')) {
    localStorage.setItem('staff_members', JSON.stringify(mockStaff));
  }
};

// Get data for a specific branch
export const getBranchData = (branchId: string) => {
  const menuItems = JSON.parse(localStorage.getItem('mock_menu_items') || '[]')
    .filter((item: any) => item.branchId === branchId);
  
  const tables = JSON.parse(localStorage.getItem('mock_tables') || '[]')
    .filter((table: any) => table.branchId === branchId);
  
  const orders = JSON.parse(localStorage.getItem('mock_orders') || '[]')
    .filter((order: any) => order.branchId === branchId);
  
  const staff = JSON.parse(localStorage.getItem('mock_staff') || '[]')
    .filter((s: any) => s.branchId === branchId);

  return { menuItems, tables, orders, staff };
};
