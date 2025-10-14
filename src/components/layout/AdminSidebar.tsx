import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import {
  UtensilsCrossed,
  Shield,
  LogOut,
  LayoutDashboard,
  Users,
  Package,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const menuItems = [
  { 
    id: 'overview',
    path: '/dashboard/admin',
    icon: LayoutDashboard,
    label: 'Overview',
    description: 'System metrics'
  },
  { 
    id: 'users',
    path: '/dashboard/admin/users',
    icon: Users,
    label: 'Users',
    description: 'Manage users'
  },
  { 
    id: 'packages',
    path: '/dashboard/admin/packages',
    icon: Package,
    label: 'Packages',
    description: 'Manage packages'
  },
];

export const AdminSidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path || (path === '/dashboard/admin' && location.pathname === '/dashboard/admin');
  };

  return (
    <aside className="w-72 border-r bg-card shadow-soft flex flex-col fixed h-screen">
      <div className="p-6 border-b">
        <Link to="/dashboard/admin" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
            <UtensilsCrossed className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <span className="text-xl font-bold block">HillDevilOS</span>
            <span className="text-xs text-muted-foreground">Admin Portal</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link key={item.id} to={item.path}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start h-auto py-3 px-4 transition-smooth",
                isActiveRoute(item.path)
                  ? "bg-primary/10 text-primary hover:bg-primary/15 border-l-4 border-primary"
                  : "hover:bg-accent"
              )}
            >
              <div className="flex items-start gap-3 w-full">
                <item.icon className={cn(
                  "h-5 w-5 mt-0.5 flex-shrink-0",
                  isActiveRoute(item.path) ? "text-primary" : ""
                )} />
                <div className="flex-1 text-left">
                  <div className={cn(
                    "font-medium text-sm",
                    isActiveRoute(item.path) ? "text-primary" : ""
                  )}>
                    {item.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {item.description}
                  </div>
                </div>
              </div>
            </Button>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-card">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="gradient-primary text-primary-foreground">
              {user?.name?.charAt(0) || 'A'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'Admin'}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Badge variant="default" className="text-xs px-1.5 py-0 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Administrator
              </Badge>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
};
