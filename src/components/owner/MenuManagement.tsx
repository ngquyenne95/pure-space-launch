import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useMenuStore, MenuItem } from '@/store/menuStore';
import { MenuItemDialog } from './MenuItemDialog';
import { MenuItemViewDialog } from './MenuItemViewDialog';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface MenuManagementProps {
  branchId: string;
}

export const MenuManagement = ({ branchId }: MenuManagementProps) => {
  const allItems = useMenuStore((state) => state.items);
const items = allItems.filter(i => i.branchId === branchId);
  const deleteItem = useMenuStore((state) => state.deleteItem);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | undefined>();
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleEdit = (item: MenuItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleView = (item: MenuItem) => {
    setSelectedItem(item);
    setIsViewDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedItem(undefined);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteItem(id);
    setItemToDelete(null);
    toast({
      title: 'Menu Item Deleted',
      description: 'The menu item has been removed.',
    });
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Menu Management</CardTitle>
              <CardDescription>Manage your restaurant's menu items</CardDescription>
            </div>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add Menu Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedItems).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No menu items yet. Add your first item!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedItems).map(([category, categoryItems]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold mb-4 text-primary">{category}</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {categoryItems.map((item) => (
                      <Card key={item.id} className="border-border/50 overflow-hidden">
                        {item.imageUrl && (
                          <div className="aspect-video bg-muted">
                            <img 
                              src={item.imageUrl} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="font-bold text-lg">{item.name}</h4>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {item.description}
                              </p>
                            </div>
                            <Badge variant={item.available ? 'default' : 'secondary'}>
                              {item.available ? 'Available' : 'Unavailable'}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <span className="text-2xl font-bold text-primary">
                              ${item.price.toFixed(2)}
                            </span>
                            <div className="flex gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleView(item)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleEdit(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setItemToDelete(item.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <MenuItemDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        branchId={branchId}
        item={selectedItem}
      />

      <MenuItemViewDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        item={selectedItem}
      />

      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this menu item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => itemToDelete && handleDelete(itemToDelete)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
