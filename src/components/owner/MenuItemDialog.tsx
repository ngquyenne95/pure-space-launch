import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/ui/image-upload';
import { useMenuStore, MenuItem } from '@/store/menuStore';
import { useCustomizationStore } from '@/store/customizationStore';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

const DEFAULT_CATEGORIES = [
  'Appetizers',
  'Soups & Salads',
  'Main Course',
  'Seafood',
  'Grills',
  'Pasta & Noodles',
  'Desserts',
  'Beverages',
  'Cocktails',
  'Milk Tea',
  'Coffee',
  'Custom',
];

const CUSTOMIZATION_CATEGORIES = [
  'Topping',
  'Size',
  'Temperature',
  'Sweetness',
  'Custom',
];

const menuItemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  category: z.string().min(2, 'Category is required'),
  parentCategory: z.string().optional(),
  isCustomizationCategory: z.boolean().default(false),
  imageUrl: z.string().optional(),
  available: z.boolean().default(true),
});

type MenuItemFormData = z.infer<typeof menuItemSchema>;

interface MenuItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: string;
  item?: MenuItem;
}

export const MenuItemDialog = ({
  open,
  onOpenChange,
  branchId,
  item,
}: MenuItemDialogProps) => {
  const addItem = useMenuStore((state) => state.addItem);
  const updateItem = useMenuStore((state) => state.updateItem);
  const allItems = useMenuStore((state) => state.items);
  const branchItems = allItems.filter(i => i.branchId === branchId);
  const {
    getCategoryCustomizations,
    getMenuItemCustomizations,
    linkMenuItemCustomization,
    unlinkMenuItemCustomization,
  } = useCustomizationStore();
  
  const [categoryType, setCategoryType] = useState<string>('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customizationCategoryType, setCustomizationCategoryType] = useState<string>('');
  const [showCustomCustomizationCategory, setShowCustomCustomizationCategory] = useState(false);
  const [allowCustomizations, setAllowCustomizations] = useState(false);
  const [selectedCustomizations, setSelectedCustomizations] = useState<Set<string>>(new Set());

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      available: true,
      isCustomizationCategory: false,
    },
  });

  const available = watch('available');
  const isCustomizationCategory = watch('isCustomizationCategory');
  const parentCategory = watch('parentCategory');
  const category = watch('category');

  // Get available customizations for this menu item
  const categoryCustomizations = !isCustomizationCategory && category 
    ? getCategoryCustomizations(category, branchId) 
    : [];
  const itemCustomizations = item ? getMenuItemCustomizations(item.id) : [];

  useEffect(() => {
    if (item) {
      const isDefaultCategory = DEFAULT_CATEGORIES.includes(item.category);
      setCategoryType(isDefaultCategory ? item.category : 'Custom');
      setShowCustomCategory(!isDefaultCategory);
      
      if (item.isCustomizationCategory && item.parentCategory) {
        const isDefaultCustomization = CUSTOMIZATION_CATEGORIES.includes(item.category);
        setCustomizationCategoryType(isDefaultCustomization ? item.category : 'Custom');
        setShowCustomCustomizationCategory(!isDefaultCustomization);
      }

      // Load linked customizations
      const linkedIds = new Set(itemCustomizations.map(c => c.id));
      setSelectedCustomizations(linkedIds);
      setAllowCustomizations(linkedIds.size > 0);
      
      reset({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        parentCategory: item.parentCategory || '',
        isCustomizationCategory: item.isCustomizationCategory || false,
        imageUrl: item.imageUrl || '',
        available: item.available,
      });
    } else {
      setCategoryType('');
      setShowCustomCategory(false);
      setCustomizationCategoryType('');
      setShowCustomCustomizationCategory(false);
      setAllowCustomizations(false);
      setSelectedCustomizations(new Set());
      reset({
        name: '',
        description: '',
        price: 0,
        category: '',
        parentCategory: '',
        isCustomizationCategory: false,
        imageUrl: '',
        available: true,
      });
    }
  }, [item, reset, open, itemCustomizations]);

  const handleCategoryTypeChange = (value: string) => {
    setCategoryType(value);
    if (value === 'Custom') {
      setShowCustomCategory(true);
      setValue('category', '');
    } else {
      setShowCustomCategory(false);
      setValue('category', value);
    }
  };

  const handleCustomizationCategoryChange = (value: string) => {
    setCustomizationCategoryType(value);
    if (value === 'Custom') {
      setShowCustomCustomizationCategory(true);
      setValue('category', '');
    } else {
      setShowCustomCustomizationCategory(false);
      setValue('category', value);
    }
  };

  const onSubmit = (data: MenuItemFormData) => {
    if (item) {
      updateItem(item.id, data);
      
      // Update customization links if not a customization item
      if (!data.isCustomizationCategory) {
        // Remove all existing links
        itemCustomizations.forEach(c => {
          unlinkMenuItemCustomization(item.id, c.id);
        });
        
        // Add new links
        if (allowCustomizations) {
          selectedCustomizations.forEach(customizationId => {
            linkMenuItemCustomization(item.id, customizationId);
          });
        }
      }
      
      toast({
        title: 'Menu Item Updated',
        description: 'The menu item has been updated successfully.',
      });
    } else {
      const newItemId = Date.now().toString();
      addItem({
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        parentCategory: data.parentCategory,
        isCustomizationCategory: data.isCustomizationCategory,
        imageUrl: data.imageUrl,
        available: data.available,
        branchId,
      });
      
      // Link customizations if enabled
      if (!data.isCustomizationCategory && allowCustomizations) {
        selectedCustomizations.forEach(customizationId => {
          linkMenuItemCustomization(newItemId, customizationId);
        });
      }
      
      toast({
        title: 'Menu Item Added',
        description: 'The menu item has been added successfully.',
      });
    }
    onOpenChange(false);
  };

  const handleToggleCustomization = (customizationId: string, isChecked: boolean) => {
    const newSelected = new Set(selectedCustomizations);
    if (isChecked) {
      newSelected.add(customizationId);
    } else {
      newSelected.delete(customizationId);
    }
    setSelectedCustomizations(newSelected);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
          <DialogDescription>
            {item ? 'Update the menu item details' : 'Add a new item to your menu'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
            <Switch
              id="isCustomizationCategory"
              checked={isCustomizationCategory}
              onCheckedChange={(checked) => setValue('isCustomizationCategory', checked)}
            />
            <Label htmlFor="isCustomizationCategory" className="cursor-pointer">
              This is a customization item (e.g., Topping, Size)
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Item Name *</Label>
            <Input {...register('name')} id="name" placeholder="e.g., Pearl, Large Size" />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {isCustomizationCategory ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="customizationCategory">Customization Category *</Label>
                <Select value={customizationCategoryType} onValueChange={handleCustomizationCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customization category" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {CUSTOMIZATION_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {showCustomCustomizationCategory && (
                  <div className="mt-2">
                    <Input
                      {...register('category')}
                      id="category"
                      placeholder="Enter custom customization category"
                    />
                  </div>
                )}
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentCategory">Parent Category *</Label>
                <Select value={parentCategory} onValueChange={(value) => setValue('parentCategory', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {DEFAULT_CATEGORIES.filter(c => c !== 'Custom').map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.parentCategory && (
                  <p className="text-sm text-destructive">{errors.parentCategory.message}</p>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
            <Select value={categoryType} onValueChange={handleCategoryTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                {DEFAULT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {showCustomCategory && (
              <div className="mt-2">
                <Input
                  {...register('category')}
                  id="category"
                  placeholder="Enter custom category name"
                />
              </div>
            )}
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              {...register('description')}
              id="description"
              placeholder="Describe the dish..."
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price ($) *</Label>
            <Input
              {...register('price')}
              id="price"
              type="number"
              step="0.01"
              placeholder="0.00"
            />
            {errors.price && (
              <p className="text-sm text-destructive">{errors.price.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <ImageUpload
              value={watch('imageUrl')}
              onChange={(value) => setValue('imageUrl', value)}
              maxSize={5}
            />
          </div>

          {!isCustomizationCategory && categoryCustomizations.length > 0 && (
            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center space-x-2">
                <Switch
                  id="allowCustomizations"
                  checked={allowCustomizations}
                  onCheckedChange={setAllowCustomizations}
                />
                <Label htmlFor="allowCustomizations" className="cursor-pointer font-semibold">
                  Allow Customizations
                </Label>
              </div>
              
              {allowCustomizations && (
                <div className="space-y-2 pl-2">
                  <p className="text-sm text-muted-foreground">Select available customizations:</p>
                  {categoryCustomizations.map((customization) => (
                    <div key={customization.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`custom-${customization.id}`}
                        checked={selectedCustomizations.has(customization.id)}
                        onCheckedChange={(checked) =>
                          handleToggleCustomization(customization.id, checked as boolean)
                        }
                      />
                      <Label htmlFor={`custom-${customization.id}`} className="cursor-pointer">
                        <div className="flex items-center gap-2">
                          <span>{customization.name}</span>
                          <Badge variant="secondary">+${customization.price.toFixed(2)}</Badge>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="available"
              checked={available}
              onCheckedChange={(checked) => setValue('available', checked)}
            />
            <Label htmlFor="available" className="cursor-pointer">
              Available for order
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{item ? 'Update' : 'Add'} Item</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
