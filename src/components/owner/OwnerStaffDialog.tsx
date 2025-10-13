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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStaffStore, StaffMember, StaffStatus } from '@/store/staffStore';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';

const staffSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type StaffFormData = z.infer<typeof staffSchema>;

interface OwnerStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: string;
  staff?: StaffMember;
}

export const OwnerStaffDialog = ({ open, onOpenChange, branchId, staff }: OwnerStaffDialogProps) => {
  const addStaff = useStaffStore((state) => state.addStaff);
  const updateStaff = useStaffStore((state) => state.updateStaff);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      status: 'active',
    },
  });

  const status = watch('status');

  useEffect(() => {
    if (staff) {
      reset({
        name: staff.name,
        email: staff.email,
        phone: staff.phone || '',
        status: staff.status,
        username: staff.username,
        password: staff.password,
      });
    } else {
      reset({
        name: '',
        email: '',
        phone: '',
        status: 'active',
        username: '',
        password: '',
      });
    }
  }, [staff, reset]);

  const onSubmit = (data: StaffFormData) => {
    const staffData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: 'manager' as const,
      status: data.status,
      username: data.username,
      password: data.password,
      branchId: branchId,
    };

    if (staff) {
      updateStaff(staff.id, staffData);
      toast({
        title: 'Manager Updated',
        description: 'The manager has been updated successfully.',
      });
    } else {
      addStaff(staffData);
      toast({
        title: 'Manager Created',
        description: 'The manager account has been created successfully.',
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{staff ? 'Edit Manager' : 'Add Manager'}</DialogTitle>
          <DialogDescription>
            {staff ? 'Update manager details' : 'Create a new manager account'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input {...register('name')} id="name" placeholder="John Doe" />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input {...register('email')} id="email" type="email" placeholder="john@restaurant.com" />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input {...register('phone')} id="phone" placeholder="+1 234 567 8900" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={status} onValueChange={(value) => setValue('status', value as StaffStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <h4 className="font-semibold mb-3">Login Credentials</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input {...register('username')} id="username" placeholder="johndoe" />
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input {...register('password')} id="password" type="password" placeholder="••••••••" />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{staff ? 'Update' : 'Create'} Manager</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
