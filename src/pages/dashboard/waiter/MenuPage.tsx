import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useMenuStore } from '@/store/menuStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { MenuItemViewDialog } from '@/components/owner/MenuItemViewDialog';

const MenuPage = () => {
  const { user } = useAuthStore();
  const branchId = user?.branchId || '';
  const { items: menuItems, updateItem } = useMenuStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const branchMenu = menuItems.filter(item => item.branchId === branchId);
  const categories = ['all', ...Array.from(new Set(branchMenu.map(item => item.category)))];

  const filteredItems = branchMenu.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || item.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleToggleAvailability = (itemId: string) => {
    const item = menuItems.find(i => i.id === itemId);
    if (item) {
      updateItem(itemId, { available: !item.available });
      toast({
        title: 'Menu updated',
        description: `${item.name} marked as ${!item.available ? 'available' : 'unavailable'}`,
      });
    }
  };

  const handleViewItem = (itemId: string) => {
    setSelectedItem(itemId);
    setViewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Menu Items</h2>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search menu items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <Card key={item.id} className="flex flex-col h-full overflow-hidden">
            <div className="bg-muted w-full min-h-[180px] flex-shrink-0">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No Image
                </div>
              )}
            </div>
            <CardHeader className="pt-2 pb-1 px-3 flex flex-col gap-1">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                {item.available ? (
                  <Badge>Available</Badge>
                ) : (
                  <Badge variant="destructive">Unavailable</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col justify-between px-3 pb-3 flex-1 space-y-3">
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">${item.price.toFixed(2)}</span>
                <Badge variant="outline">{item.category}</Badge>
              </div>
              <div className="flex gap-2 mt-auto">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleViewItem(item.id)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
                <Button
                  variant={item.available ? 'destructive' : 'default'}
                  className="flex-1"
                  onClick={() => handleToggleAvailability(item.id)}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  {item.available ? 'Mark Out' : 'Mark In'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>


      <MenuItemViewDialog
        item={menuItems.find(i => i.id === selectedItem)}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />
    </div>
  );
};

export default MenuPage;
